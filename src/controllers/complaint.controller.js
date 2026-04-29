const { callSP } = require('../config/db.postgres');
const retryMongoInsert = require('../utils/retryMongo');


const { getDb } = require('../config/db.mongo');


const { sendEmail } = require('../services/email.service');

exports.registerComplaint = async (req, res, next) => {
  try {
    const {
      device_qr_id,
      vendor_id,
      complaint_type,
      complaint_priority,
      complaint_status,
      complaint_description,
      complaint_resolution_notes,
      complaint_visit_notes
    } = req.body;

    // 1. PostgreSQL insert
    const result = await callSP(
      `SELECT sp_register_complaint(
        :user_id,
        :device_qr_id,
        :vendor_id,
        :complaint_type,
        :complaint_priority,
        :complaint_status
      )`,
      {
        user_id: req.user ? req.user.id : null,
        device_qr_id,
        vendor_id,
        complaint_type,
        complaint_priority,
        complaint_status
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
          complaint_id: response.complaint_id,
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

Complaint ID: ${details?.complaint_id}
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
  console.log("Response:", response);

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

      // ⚡ DON'T BLOCK RESPONSE
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

      // ⚡ fire-and-forget
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

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

//update complaint status by vendor or technician
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaint_id, complaint_status } = req.body;

    const result = await callSP(
      `SELECT sp_update_complaint_status(
        :user_id,
        :complaint_id,
        :complaint_status
      )`,
      {
        user_id: req.user.id,
        complaint_id,
        complaint_status
      }
    );

    const response = result?.[0]?.sp_update_complaint_status;

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

// get all complaint by admin vendor and technician
exports.getAllComplaints = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_all_complaints(:user_id)`,
      {
        user_id: req.user.id
      }
    );

    const response = result?.[0]?.sp_get_all_complaints;

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};