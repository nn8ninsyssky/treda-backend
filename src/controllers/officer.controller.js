const { callSP } = require('../config/db.postgres');


// Update Admin Profile
exports.updateMyAdmin = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_admin(:user_id, :data)`,
      {
        user_id: req.user.id,
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_update_admin;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

// Fetch Admin Details
exports.getMyAdmin = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_admin_by_user_id(:user_id)`,
      { user_id: req.user.id }
    );

    res.json(result[0].sp_get_admin_by_user_id);

  } catch (err) {
    next(err);
  }
};

// Delete Admin Profile and Account
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await callSP(
      `SELECT sp_delete_admin(:user_id)`,
      { user_id: id }
    );

    const response = result[0].sp_delete_admin;

    if (!response.success) {
      return res.status(404).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

// Update Vendor Profile by Admin
exports.updateMyVendorByAdmin = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_vendor_by_admin(:user_id, :data)`,
      {
        user_id: req.params.user_id, // ✅ FIX
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_update_vendor_by_admin;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

// Fetch All Vendor Details for Admin
exports.getAllVendors = async (req, res, next) => {
  try {

    const result = await callSP(
      `SELECT sp_get_all_vendors_for_admin()`
    );

    const response = result[0].sp_get_all_vendors_for_admin;

    // Handle unexpected null
    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendors"
      });
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

// Fetch All Customer Details for Admin

exports.getAllCustomersForAdmin = async (req, res, next) => {
  try {
    // Get query params (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await callSP(
      `SELECT sp_get_all_customers_for_admin(:page, :limit)`,
      { page, limit }
    );

    const response = result[0].sp_get_all_customers_for_admin;

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};