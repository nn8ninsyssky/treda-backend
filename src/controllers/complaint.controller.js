const { callSP } = require('../config/db.postgres');
const retryMongoInsert = require('../utils/retryMongo');


const { getDb } = require('../config/db.mongo');


const { sendEmail } = require('../services/email.service');

exports.registerComplaint = async (req, res, next) => {
  try {
        const user_id = req.user?.id || null;

    const {
      device_qr_id,
      assigned_vendor_code = null,
      complaint_type = null,
      complaint_priority = null,
      complaint_status = "open",
    } = req.body;

    // 1. PostgreSQL insert
    const result = await callSP(
      `
      SELECT public.sp_register_complaint(
        :user_id,
        :device_qr_id,
        :assigned_vendor_code,
        :complaint_type,
        :complaint_priority,
        :complaint_status
      )
      `,
      {
        user_id,
        device_qr_id,
        assigned_vendor_code,
        complaint_type,
        complaint_priority,
        complaint_status,
      }
    );

    const response = result?.[0]?.sp_register_complaint;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // 2. Mongo insert
    try {
      const db = getDb();

      await retryMongoInsert(async () => {
        return db.collection('complaint').insertOne({
          complaint_no: response.complaint_no,
          complaint_description: complaint_description || "",
          complaint_resolution_notes: complaint_resolution_notes || "",
          complaint_visit_notes: complaint_visit_notes || "",
          created_at: new Date()
        });
      });

    } catch (mongoErr) {
      console.error("Mongo insert failed:", mongoErr.message);
    }

    //  3. EMAIL NOTIFICATION
    
    const detailsResult = await callSP(
  `SELECT sp_get_complaint_by_device_qr(:device_qr_id)`,
  { device_qr_id }
);

const details = detailsResult?.[0]?.sp_get_complaint_by_device_qr.data;

console.log("Full complaint details:", details);
const emailText = `
Complaint Details:

Complaint NO: ${details?.complaint_no}
Device QR: ${details?.device_qr_id}
Type: ${details?.type}
Priority: ${details?.priority}
Status: ${details?.status}
complaint_at:${details?.updated_at}
Vendor:
Name: ${details.vendor?.name}
Phone: ${details.vendor?.phone}
Disctrict:${details.vendor?.district}
State:${details.vendor?.state}
Country:${details.vendor?.country}
Status:${details.vendor?.status}
Technician:
Name: ${details.technician?.name}
Phone: ${details.technician?.phone}
Specialization:${details.technician?.specialization}
Status:${details.technician?.status}
`;

try {

  // ===== VENDOR EMAIL =====
  if (response.vendor_assignment_status === 'accepted') {
    const vendorEmailResult = await callSP(
      `SELECT sp_get_user_email_by_vendor(:vendor_id)`,
      { vendor_id: response.assigned_vendor_id }
    );

    const vendorEmail =
      vendorEmailResult?.[0]?.sp_get_user_email_by_vendor;

    if (!vendorEmail) {
      console.warn("Vendor email not found");
    } else {
      console.log("Sending email to vendor:", vendorEmail);

      // DON'T BLOCK RESPONSE
      sendEmail({
        to: vendorEmail,
        subject: "New Complaint Assigned",
        text: emailText,
      });
    }
  }

  // ===== TECHNICIAN EMAIL =====
  if (response.technician_assignment_status === 'accepted') {
    const techEmailResult = await callSP(
      `SELECT sp_get_user_email_by_technician(:technician_id)`,
      { technician_id: response.assigned_technician_id }
    );

    const techEmail =
      techEmailResult?.[0]?.sp_get_user_email_by_technician;

    if (!techEmail) {
      console.warn(" Technician email not found");
    } else {
      console.log("Sending email to technician:", techEmail);

      // fire-and-forget
      sendEmail({
        to: techEmail,
        subject: "New Task Assigned",
        text: emailText,
      });
    }
  }

} catch (emailErr) {
  console.error("Email error:", emailErr);
}

    res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};

exports.getComplaintByDeviceQR = async (req, res, next) => {
  try {
    const { device_qr_id } = req.params;

    if (!device_qr_id) {
      return res.status(400).json({
        success: false,
        message: "device_qr_id is required"
      });
    }

    // 1. Fetch main complaint details from PostgreSQL
    const result = await callSP(
      `SELECT sp_get_complaint_by_device_qr(:device_qr_id)`,
      { device_qr_id }
    );

    const response = result?.[0]?.sp_get_complaint_by_device_qr;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch complaint details"
      });
    }

    if (!response.success) {
      return res.status(404).json(response);
    }

    const complaintNo = response?.data?.complaint_no;

    // 2. Fetch extra complaint details from MongoDB
    let mongoComplaintDetails = null;

    if (complaintNo) {
      const db = getDb();

      mongoComplaintDetails = await db
        .collection("complaints")
        .findOne(
          { complaint_no: complaintNo },
          {
            projection: {
              _id: 1,
              complaint_no: 1,
              complaint_description: 1,
              complaint_resolution_notes: 1,
              complaint_visit_notes: 1,
              created_at: 1,
              updated_at: 1
            }
          }
        );
    }

    // 3. Attach MongoDB details to PostgreSQL response
    return res.status(200).json({
      ...response,
      data: {
        ...response.data,
        mongo_details: mongoComplaintDetails
          ? {
              id: mongoComplaintDetails._id,
              complaint_no: mongoComplaintDetails.complaint_no,
              complaint_description: mongoComplaintDetails.complaint_description,
              complaint_resolution_notes: mongoComplaintDetails.complaint_resolution_notes,
              complaint_visit_notes: mongoComplaintDetails.complaint_visit_notes,
              created_at: mongoComplaintDetails.created_at,
              updated_at: mongoComplaintDetails.updated_at || null
            }
          : null
      }
    });

  } catch (err) {
    next(err);
  }
};

//update complaint status by vendor or technician


// exports.updateComplaintStatus = async (req, res, next) => {
//   try {
//     const { complaint_id, complaint_status } = req.body;

//     const result = await callSP(
//       `SELECT sp_update_complaint_status(
//         :user_id,
//         :complaint_id,
//         :complaint_status
//       )`,
//       {
//         user_id: req.user.id,
//         complaint_id,
//         complaint_status
//       }
//     );

//     const response = result?.[0]?.sp_update_complaint_status;

//     if (!response.success) {
//       return res.status(400).json(response);
//     }

//     return res.status(200).json(response);

//   } catch (err) {
//     next(err);
//   }
// };


exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const {
      complaint_no,
      complaint_status = null,
      vendor_assignment_status = null,
      technician_assignment_status = null,
    } = req.body;

    if (!complaint_no) {
      return res.status(400).json({
        success: false,
        message: "complaint_no is required",
      });
    }

    const result = await callSP(
      `
      SELECT public.sp_update_complaint_status(
        :user_id,
        :complaint_no,
        :complaint_status,
        :vendor_assignment_status,
        :technician_assignment_status
      )
      `,
      {
        user_id: req.user.id,
        complaint_no,
        complaint_status,
        vendor_assignment_status,
        technician_assignment_status,
      }
    );

    const response = result?.[0]?.sp_update_complaint_status;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to update complaint status",
      });
    }

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};
// get all complaint by admin vendor and technician

exports.getAllComplaintsRolewise = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const {
      page = 1,
      limit = 10,
      search = null,
      year = null,
      month = null,
      device_qr_id = null,
      complaint_priority = null,
    } = req.query;

    const result = await callSP(
      `
      SELECT public.sp_get_all_complaints_rolewise(
        :user_id,
        :page,
        :limit,
        :search,
        :year,
        :month,
        :device_qr_id,
        :complaint_priority
      )
      `,
      {
        user_id,
        page: Number(page),
        limit: Number(limit),
        search: search || null,
        year: year ? Number(year) : null,
        month: month ? Number(month) : null,
        device_qr_id: device_qr_id || null,
        complaint_priority: complaint_priority || null,
      }
    );

    const response = result?.[0]?.sp_get_all_complaints_rolewise;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch complaints",
      });
    }

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};