const { callSP } = require('../config/db.postgres');

exports.registerDevice = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_register_device(:user_id, :data)`,
      {
        user_id: req.user.id, 
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_register_device;

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};

// Fetch device, vendor, customer details for complaint raisers
exports.getDeviceFullDetails = async (req, res, next) => {
  try {
    const { device_qr_id } = req.params;

    const result = await callSP(
      `SELECT sp_get_device_full_details(:device_qr_id)`,
      { device_qr_id }
    );

    const response = result?.[0]?.sp_get_device_full_details;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch device details"
      });
    }

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};