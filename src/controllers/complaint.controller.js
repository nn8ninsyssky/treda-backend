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