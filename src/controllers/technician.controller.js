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