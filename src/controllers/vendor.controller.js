const { callSP } = require('../config/db.postgres');



exports.updateMyVendor = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_vendor(:user_id, :data)`,
      {
        user_id: req.user.id,
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_update_vendor;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

exports.getMyVendor = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_vendor_by_user_id(:user_id)`,
      { user_id: req.user.id }
    );

    res.json(result[0].sp_get_vendor_by_user_id);

  } catch (err) {
    next(err);
  }
};
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await callSP(
      `SELECT sp_delete_vendor(:user_id)`,
      { user_id: id }
    );

    const response = result[0].sp_delete_vendor;

    if (!response.success) {
      return res.status(404).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

// For Technician Update by Vendor

exports.updateMyTechnicianByAdmin = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_technician_by_admin(:user_id, :data)`,
      {
        user_id: req.params.user_id, 
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_update_technician_by_admin;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};


// For getting all Technicians Data

exports.getMyTechnicians = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = null } = req.query;

    const result = await callSP(
      `SELECT sp_get_technicians_by_vendor(:user_id, :page, :limit, :search)`,
      {
        user_id: req.user.id,
        page: parseInt(page),
        limit: parseInt(limit),
        search
      }
    );

    res.json(result[0].sp_get_technicians_by_vendor);

  } catch (err) {
    next(err);
  }
};

// For getting all devices under logged in vendor
exports.getAllDevicesForVendor = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_devices_by_vendor(:user_id)`,
      {
        user_id: req.user.id
      }
    );

    const response = result?.[0]?.sp_get_devices_by_vendor;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch devices"
      });
    }

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

// Update devices details by vendor
exports.updateDeviceByVendor = async (req, res, next) => {
  try {
    const { device_id } = req.params;

    const result = await callSP(
      `SELECT sp_update_device_by_vendor(:user_id, :device_id, :data)`,
      {
        user_id: req.user.id,
        device_id,
        data: req.body
      }
    );

    const response = result?.[0]?.sp_update_device_by_vendor;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to update device"
      });
    }

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};