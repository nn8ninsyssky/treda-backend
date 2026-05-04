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

exports.getAllVendorsForAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      year,
      month,
      district,
      state,
      latitude,
      longitude,
      radius_km = 10,
    } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const parsedYear =
      year === undefined || year === '' || year === 'All'
        ? null
        : Number(year);

    const parsedMonth =
      month === undefined || month === '' || month === 'All'
        ? null
        : Number(month);

    const parsedDistrict =
      district === undefined || district === '' || district === 'All'
        ? null
        : district;

    const parsedState =
      state === undefined || state === '' || state === 'All'
        ? null
        : state;

    const parsedLatitude =
      latitude === undefined || latitude === ''
        ? null
        : Number(latitude);

    const parsedLongitude =
      longitude === undefined || longitude === ''
        ? null
        : Number(longitude);

    const parsedRadius =
      radius_km === undefined || radius_km === ''
        ? 10
        : Number(radius_km);

    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page value',
      });
    }

    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit value',
      });
    }

    if (parsedYear !== null && Number.isNaN(parsedYear)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year value',
      });
    }

    if (parsedMonth !== null && Number.isNaN(parsedMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month value',
      });
    }

    if (parsedMonth !== null && (parsedMonth < 1 || parsedMonth > 12)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12',
      });
    }

    if (parsedMonth !== null && parsedYear === null) {
      return res.status(400).json({
        success: false,
        message: 'Year is required when month is provided',
      });
    }

    if (parsedLatitude !== null && Number.isNaN(parsedLatitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude value',
      });
    }

    if (parsedLongitude !== null && Number.isNaN(parsedLongitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude value',
      });
    }

    if (
      (parsedLatitude !== null && parsedLongitude === null) ||
      (parsedLatitude === null && parsedLongitude !== null)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Both latitude and longitude are required for location filter',
      });
    }

    if (Number.isNaN(parsedRadius) || parsedRadius <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid radius_km value',
      });
    }

    const result = await callSP(
      `
      SELECT public.sp_get_all_vendors_for_admin(
        :page,
        :limit,
        :year,
        :month,
        :district,
        :state,
        :latitude,
        :longitude,
        :radius_km
      ) AS response
      `,
      {
        page: parsedPage,
        limit: parsedLimit,
        year: parsedYear,
        month: parsedMonth,
        district: parsedDistrict,
        state: parsedState,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        radius_km: parsedRadius,
      }
    );

    const response = result[0].response;

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

// Fetch All Customer Details for Admin


exports.getAllPanchayatsForAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      year,
      month,
      district,
      state,
      latitude,
      longitude,
      radius_km = 10,
    } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const parsedYear =
      year === undefined || year === '' || year === 'All'
        ? null
        : Number(year);

    const parsedMonth =
      month === undefined || month === '' || month === 'All'
        ? null
        : Number(month);

    const parsedLatitude =
      latitude === undefined || latitude === ''
        ? null
        : Number(latitude);

    const parsedLongitude =
      longitude === undefined || longitude === ''
        ? null
        : Number(longitude);

    const parsedRadius =
      radius_km === undefined || radius_km === ''
        ? 10
        : Number(radius_km);

    const parsedDistrict =
      district === undefined || district === '' || district === 'All'
        ? null
        : district;

    const parsedState =
      state === undefined || state === '' || state === 'All'
        ? null
        : state;

    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page value',
      });
    }

    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit value',
      });
    }

    if (parsedYear !== null && Number.isNaN(parsedYear)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year value',
      });
    }

    if (parsedMonth !== null && Number.isNaN(parsedMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month value',
      });
    }

    if (parsedMonth !== null && (parsedMonth < 1 || parsedMonth > 12)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12',
      });
    }

    if (parsedMonth !== null && parsedYear === null) {
      return res.status(400).json({
        success: false,
        message: 'Year is required when month is provided',
      });
    }

    if (parsedLatitude !== null && Number.isNaN(parsedLatitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude value',
      });
    }

    if (parsedLongitude !== null && Number.isNaN(parsedLongitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude value',
      });
    }

    if (
      (parsedLatitude !== null && parsedLongitude === null) ||
      (parsedLatitude === null && parsedLongitude !== null)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Both latitude and longitude are required for location filter',
      });
    }

    if (Number.isNaN(parsedRadius) || parsedRadius <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid radius_km value',
      });
    }

    const result = await callSP(
      `
      SELECT public.sp_get_all_panchayats_for_admin(
        :page,
        :limit,
        :year,
        :month,
        :district,
        :state,
        :latitude,
        :longitude,
        :radius_km
      ) AS response
      `,
      {
        page: parsedPage,
        limit: parsedLimit,
        year: parsedYear,
        month: parsedMonth,
        district: parsedDistrict,
        state: parsedState,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        radius_km: parsedRadius,
      }
    );

    const response = result[0].response;

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

// Fetch all Technicians for Admin
exports.getAllTechnicians = async (req, res, next) => {
  try {

    const {
      page = 1,
      limit = 10,
      search = null
    } = req.query;

    const result = await callSP(
      `SELECT sp_get_all_technicians_for_admin(
        :page,
        :limit,
        :search
      )`,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        search
      }
    );

    const response = result?.[0]?.sp_get_all_technicians_for_admin;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch technicians"
      });
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

//Fetch all devices for Admin
exports.getAllDevicesforAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query;

    const result = await callSP(
      `SELECT sp_get_all_devices_for_admin(:page, :limit)`,
      {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    );

    const response = result?.[0]?.sp_get_all_devices_for_admin;

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