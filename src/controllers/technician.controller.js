const { User } = require('../models/pg');
const bcrypt = require('bcrypt');

exports.createTechnician = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Technician already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tech = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'technician',
    });

    res.status(201).json({
      success: true,
      message: 'Technician created by vendor',
      data: tech,
    });

  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Fetched all records',
      data: [],
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Fetched record ${req.params.id}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Updated record ${req.params.id}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Deleted record ${req.params.id}`,
    });
  } catch (err) {
    next(err);
  }
};