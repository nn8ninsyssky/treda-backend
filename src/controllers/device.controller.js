const { callSP } = require('../config/db.postgres');

exports.registerDevice = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_register_device(:user_id, :data)`,
      {
        user_id: req.user.id, // ✅ from JWT
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