const { callSP } = require('../config/db.postgres');
const retryMongoInsert = require('../utils/retryMongo');


const { getDb } = require('../config/db.mongo');


const { sendEmail } = require('../services/email.service');

exports.registerComplaint = async (req, res, next) => {
  try {
    console.log("🔥 registerComplaint API HIT");
    console.log("REQ USER:", req.user || null);
    console.log("REQ BODY:", req.body);

    const user_id = req.user?.id || null;

    console.log("Resolved user_id:", user_id);

    const {
      device_qr_id,
      assigned_vendor_code = null,
      complaint_type = null,
      complaint_priority = null,
      complaint_status = "pending",

      complaint_description = "",
      complaint_resolution_notes = "",
      complaint_visit_notes = "",
    } = req.body;

    console.log("Parsed complaint payload:", {
      user_id,
      device_qr_id,
      assigned_vendor_code,
      complaint_type,
      complaint_priority,
      complaint_status,
      complaint_description,
      complaint_resolution_notes,
      complaint_visit_notes,
    });

    // 1. PostgreSQL insert
    console.log("Calling SP: public.sp_register_complaint");

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

    console.log("Raw SP result:", JSON.stringify(result, null, 2));

    const response = result?.[0]?.sp_register_complaint;

    console.log("Parsed SP response:", JSON.stringify(response, null, 2));

    if (!response.success) {
      console.warn("SP returned success false:", JSON.stringify(response, null, 2));
      return res.status(400).json(response);
    }

    if (!response) {
      console.error("No response from database SP");
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    console.log("PostgreSQL complaint inserted successfully:", {
      complaint_no: response.complaint_no,
      assigned_vendor_code: response.assigned_vendor_code,
      assigned_technician_code: response.assigned_technician_code,
      vendor_assignment_status: response.vendor_assignment_status,
      technician_assignment_status: response.technician_assignment_status,
    });

    // 2. Mongo insert
    try {
      console.log("Preparing MongoDB insert...");

      const db = getDb();

      console.log("MongoDB instance received:", !!db);
      console.log("MongoDB target collection: complaint");

      const mongoPayload = {
        complaint_no: response.complaint_no,
        complaint_description: complaint_description || "",
        complaint_resolution_notes: complaint_resolution_notes || "",
        complaint_visit_notes: complaint_visit_notes || "",
        created_at: new Date()
      };

      console.log("MongoDB insert payload:", JSON.stringify(mongoPayload, null, 2));

      await retryMongoInsert(async () => {
        const mongoInsertResult = await db.collection('complaint').insertOne(mongoPayload);

        console.log("MongoDB insert result:", JSON.stringify({
          acknowledged: mongoInsertResult.acknowledged,
          insertedId: mongoInsertResult.insertedId,
        }, null, 2));

        return mongoInsertResult;
      });

      console.log("MongoDB complaint insert completed successfully");

    } catch (mongoErr) {
      console.error("Mongo insert failed:", mongoErr.message);
      console.error("Mongo insert full error:", mongoErr);
    }

    //  3. EMAIL NOTIFICATION

    console.log("Fetching complaint full details using device_qr_id:", device_qr_id);

    const detailsResult = await callSP(
      `SELECT sp_get_complaint_by_device_qr(:device_qr_id)`,
      { device_qr_id }
    );

    console.log("Raw complaint details SP result:", JSON.stringify(detailsResult, null, 2));

    const details = detailsResult?.[0]?.sp_get_complaint_by_device_qr.data;

    console.log("Full complaint details:", JSON.stringify(details, null, 2));

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

    console.log("Prepared email text:", emailText);

    try {
      console.log("Starting email notification flow...");

      // ===== VENDOR EMAIL =====
      console.log("Vendor assignment status:", response.vendor_assignment_status);

      if (response.vendor_assignment_status === 'accepted') {
        console.log("Vendor assignment accepted. Fetching vendor email...");
        console.log("Vendor code being passed:", response.assigned_vendor_code);

        const vendorEmailResult = await callSP(
          `SELECT sp_get_user_email_by_vendor(:vendor_code)`,
          { vendor_code: response.assigned_vendor_code }
        );

        console.log("Raw vendor email SP result:", JSON.stringify(vendorEmailResult, null, 2));

        const vendorEmail =
          vendorEmailResult?.[0]?.sp_get_user_email_by_vendor;

        console.log("Parsed vendor email:", vendorEmail);

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

          console.log("Vendor email sendEmail() called successfully");
        }
      } else {
        console.log("Vendor email skipped because vendor_assignment_status is not accepted");
      }

      // ===== TECHNICIAN EMAIL =====
      console.log("Technician assignment status:", response.technician_assignment_status);

      if (response.technician_assignment_status === 'accepted') {
        console.log("Technician assignment accepted. Fetching technician email...");
        console.log("Technician code being passed:", response.assigned_technician_code);

        const techEmailResult = await callSP(
          `SELECT sp_get_user_email_by_technician(:technician_code)`,
          { technician_code: response.assigned_technician_code }
        );

        console.log("Raw technician email SP result:", JSON.stringify(techEmailResult, null, 2));

        const techEmail =
          techEmailResult?.[0]?.sp_get_user_email_by_technician;

        console.log("Parsed technician email:", techEmail);

        if (!techEmail) {
          console.warn("Technician email not found");
        } else {
          console.log("Sending email to technician:", techEmail);

          // fire-and-forget
          sendEmail({
            to: techEmail,
            subject: "New Task Assigned",
            text: emailText,
          });

          console.log("Technician email sendEmail() called successfully");
        }
      } else {
        console.log("Technician email skipped because technician_assignment_status is not accepted");
      }

    } catch (emailErr) {
      console.error("Email error:", emailErr);
      console.error("Email error message:", emailErr.message);
    }

    console.log("Final API response being sent:", JSON.stringify(response, null, 2));

    res.status(201).json(response);

  } catch (err) {
    console.error("registerComplaint controller error:", err);
    console.error("registerComplaint error message:", err.message);
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

// exports.getAllComplaintsRolewise = async (req, res, next) => {
//   try {
//     const user_id = req.user.id;

//     const {
//       page = 1,
//       limit = 10,
//       search = null,
//       year = null,
//       month = null,
//       device_qr_id = null,
//       complaint_priority = null,
//     } = req.query;

//     const result = await callSP(
//       `
//       SELECT public.sp_get_all_complaints_rolewise(
//         :user_id,
//         :page,
//         :limit,
//         :search,
//         :year,
//         :month,
//         :device_qr_id,
//         :complaint_priority
//       )
//       `,
//       {
//         user_id,
//         page: Number(page),
//         limit: Number(limit),
//         search: search || null,
//         year: year ? Number(year) : null,
//         month: month ? Number(month) : null,
//         device_qr_id: device_qr_id || null,
//         complaint_priority: complaint_priority || null,
//       }
//     );

//     const response = result?.[0]?.sp_get_all_complaints_rolewise;

//     if (!response) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch complaints",
//       });
//     }

//     if (!response.success) {
//       return res.status(400).json(response);
//     }

//     return res.status(200).json(response);
//   } catch (err) {
//     next(err);
//   }
// };


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

    /*
      PostgreSQL response.data is expected to be an array of complaints.
      Now we fetch MongoDB complaint notes using complaint_no.
    */
    const postgresComplaints = Array.isArray(response.data)
      ? response.data
      : [];

    let finalComplaints = postgresComplaints;

    try {
      const complaintNos = postgresComplaints
        .map((complaint) => complaint.complaint_no)
        .filter(Boolean);

      if (complaintNos.length > 0) {
        const db = getDb();

        const mongoComplaints = await db
          .collection("complaint")
          .find({
            complaint_no: { $in: complaintNos },
          })
          .toArray();

        const mongoComplaintMap = {};

        mongoComplaints.forEach((doc) => {
          mongoComplaintMap[doc.complaint_no] = {
            id: doc._id,
            complaint_no: doc.complaint_no,
            complaint_description: doc.complaint_description || "",
            complaint_resolution_notes: doc.complaint_resolution_notes || "",
            complaint_visit_notes: doc.complaint_visit_notes || "",
            created_at: doc.created_at || null,
            updated_at: doc.updated_at || null,
          };
        });

        finalComplaints = postgresComplaints.map((complaint) => ({
          ...complaint,
          mongo_details: mongoComplaintMap[complaint.complaint_no] || null,
        }));
      } else {
        finalComplaints = postgresComplaints.map((complaint) => ({
          ...complaint,
          mongo_details: null,
        }));
      }
    } catch (mongoErr) {
      console.error("Mongo complaint fetch failed:", mongoErr.message);

      /*
        Do not fail the API if MongoDB fails.
        PostgreSQL is the main source of truth.
      */
      finalComplaints = postgresComplaints.map((complaint) => ({
        ...complaint,
        mongo_details: null,
      }));
    }

    return res.status(200).json({
      ...response,
      data: finalComplaints,
    });
  } catch (err) {
    next(err);
  }
};