
const { callSP } = require('../config/db.postgres');

exports.getMyCustomer = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_customer_by_user_id(:user_id)`,
      { user_id: req.user.id }
    );

    res.json(result[0].sp_get_customer_by_user_id);

  } catch (err) {
    next(err);
  }
};

exports.updateMyCustomer = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_customer(:user_id, :data)`,
      {
        user_id: req.user.id,
        data: JSON.stringify(req.body)
        
      }
    );

    res.json(result[0].sp_update_customer);

  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_delete_customer(:id)`,
      { id: req.params.id }
    );

    res.json(result[0].sp_delete_customer);

  } catch (err) {
    next(err);
  }
};

//Fetch all devices for customer
exports.getMyDevices = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_devices_by_customer(:user_id)`,
      {
        user_id: req.user.id
      }
    );

    const response = result?.[0]?.sp_get_devices_by_customer;

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

//Fecth all vendors from which customer had taken devices
exports.getMyVendorsForCustomer = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_vendors_by_customer(:user_id)`,
      {
        user_id: req.user.id
      }
    );

    const response = result?.[0]?.sp_get_vendors_by_customer;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendors"
      });
    }

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};