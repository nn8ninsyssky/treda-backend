const { callSP } = require('../config/db.postgres');

exports.updateMyTechnician = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_technician(:user_id, :data)`,
      {
        user_id: req.user.id,
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_update_technician;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

exports.getMyTechnician = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_technician_by_user_id(:user_id)`,
      { user_id: req.user.id }
    );

    res.json(result[0].sp_get_technician_by_user_id);

  } catch (err) {
    next(err);
  }
};

// Fetch All Vendor Details for technician
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