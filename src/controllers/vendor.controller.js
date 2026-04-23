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