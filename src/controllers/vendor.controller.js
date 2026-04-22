const { User } = require('../models/pg');
const bcrypt = require('bcrypt');
const { Vendor } = require('../models/pg');

exports.createVendor = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Vendor already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'vendor',
    });

    res.status(201).json({
      success: true,
      message: 'Vendor created by officer',
      data: vendor,
    });

  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { district, state, search, page = 1, limit = 10 } = req.query;

    // 🔥 WHERE CONDITION
    const where = {};

    if (district) {
      where.vendor_district = district;
    }

    if (state) {
      where.vendor_state = state;
    }

    // 🔍 SEARCH (case-insensitive)
    if (search) {
      const { Op } = require("sequelize");

      where.vendor_name = {
        [Op.iLike]: `%${search}%`
      };
    }

    // 📄 PAGINATION
    const offset = (page - 1) * limit;

    const { count, rows } = await Vendor.findAndCountAll({
      where,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Vendors fetched successfully',
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows
    });

  } catch (err) {
    next(err);
  }
};

// exports.getOne = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const vendor = await Vendor.findOne({
//       where: { vendor_id: id }
//     });

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Vendor fetched successfully',
//       data: vendor
//     });

//   } catch (err) {
//     next(err);
//   }
// };

exports.updateMyVendor = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const vendor = await Vendor.findOne({
      where: { user_id: userId }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found"
      });
    }

    // ✅ Update only provided fields
   const allowedFields = [
  "vendor_name",
  "company_reg_no",
  "vendor_gst_no",
  "vendor_contact_person_name",
  "vendor_phone",
  "vendor_district",
  "vendor_state",
  "vendor_country",
  "vendor_latitude",
  "vendor_longitude"
];


allowedFields.forEach(field => {
  if (req.body[field] !== undefined) {
    vendor[field] = req.body[field];
  }
});

    await vendor.save();

    res.json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor
    });

  } catch (err) {
    next(err);
  }
};

exports.getMyVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      where: { user_id: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.json({
      success: true,
      data: vendor
    });

  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      where: { vendor_id: id }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    // 🔥 delete linked user
    await User.destroy({
      where: { id: vendor.user_id }
    });

    // delete vendor
    await vendor.destroy();

    res.json({
      success: true,
      message: "Vendor and user deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};