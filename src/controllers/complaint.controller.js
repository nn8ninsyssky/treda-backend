const { callSP } = require('../config/db.postgres');

exports.registerComplaint = async (req, res, next) => {
  try {
    const {
      device_qr_id,
      vendor_id,
      complaint_type,
      complaint_priority
    } = req.body;

    const result = await callSP(
      `SELECT sp_register_complaint(
        :user_id,
        :device_qr_id,
        :vendor_id,
        :complaint_type,
        :complaint_priority
      )`,
      {
        user_id: req.user ? req.user.id : null, // ✅ guest supported
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

    res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};