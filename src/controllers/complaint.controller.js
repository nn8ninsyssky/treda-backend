const { callSP } = require('../config/db.postgres');

// exports.registerComplaint = async (req, res, next) => {
//   try {
//     const {
//       device_qr_id,
//       vendor_id,
//       complaint_type,
//       complaint_priority
//     } = req.body;

//     const result = await callSP(
//       `SELECT sp_register_complaint(
//         :user_id,
//         :device_qr_id,
//         :vendor_id,
//         :complaint_type,
//         :complaint_priority
//       )`,
//       {
//         user_id: req.user ? req.user.id : null, // ✅ guest supported
//         device_qr_id,
//         vendor_id,
//         complaint_type,
//         complaint_priority
//       }
//     );

//     const response = result?.[0]?.sp_register_complaint;

//     if (!response.success) {
//       return res.status(400).json(response);
//     }

//     res.status(201).json(response);

//   } catch (err) {
//     next(err);
//   }
// };


const { getDb } = require('../config/db.mongo');

exports.registerComplaint = async (req, res, next) => {
  try {
    const {
      device_qr_id,
      vendor_id,
      complaint_type,
      complaint_priority,
      complaint_description,
      complaint_resolution_notes,
      complaint_visit_notes
    } = req.body;

    // 1. Insert into PostgreSQL
    const result = await callSP(
      `SELECT sp_register_complaint(
        :user_id,
        :device_qr_id,
        :vendor_id,
        :complaint_type,
        :complaint_priority
      )`,
      {
        user_id: req.user ? req.user.id : null,
        device_qr_id,
        vendor_id,
        complaint_type,
        complaint_priority
      }
    );

    const response = result?.[0]?.sp_register_complaint;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // 2. Insert into MongoDB (NO MODEL ✅)
    const db = getDb();

   

if (!db) {
  console.error("MongoDB not initialized");
} else {
   try {
  await db.collection('complaint').insertOne({
    complaint_id: response.complaint_id,
    complaint_description: complaint_description || "",
    complaint_resolution_notes: complaint_resolution_notes || "",
    complaint_visit_notes: complaint_visit_notes || "",
    created_at: new Date()
  });
} catch (mongoErr) {
  console.error("Mongo insert failed:", mongoErr.message);
  // DO NOT fail request
}
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