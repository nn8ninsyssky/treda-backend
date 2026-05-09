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

// update panchayat details from admin
exports.updatePanchayatAdmin = async (req, res, next) => {
  try {
    const {
      panchayat_code,
      panchayat_partition_month,

      panchayat_name,
      panchayat_phone,
      panchayat_alt_phone,
      panchayat_village,
      panchayat_block,
      panchayat_district,
      panchayat_state,
      panchayat_country,
      panchayat_latitude,
      panchayat_longitude,
      panchayat_pincode,
    } = req.body || {};

    const payload = {};

    if (
      panchayat_code !== undefined &&
      panchayat_code !== null &&
      String(panchayat_code).trim() !== ""
    ) {
      payload.panchayat_code = String(panchayat_code).trim();
    }

    if (
      panchayat_partition_month !== undefined &&
      panchayat_partition_month !== null &&
      String(panchayat_partition_month).trim() !== ""
    ) {
      payload.panchayat_partition_month = String(panchayat_partition_month).trim();
    }

    if (
      panchayat_name !== undefined &&
      panchayat_name !== null &&
      String(panchayat_name).trim() !== ""
    ) {
      payload.panchayat_name = String(panchayat_name).trim();
    }

    if (
      panchayat_phone !== undefined &&
      panchayat_phone !== null &&
      String(panchayat_phone).trim() !== ""
    ) {
      payload.panchayat_phone = String(panchayat_phone).trim();
    }

    if (
      panchayat_alt_phone !== undefined &&
      panchayat_alt_phone !== null &&
      String(panchayat_alt_phone).trim() !== ""
    ) {
      payload.panchayat_alt_phone = String(panchayat_alt_phone).trim();
    }

    if (
      panchayat_village !== undefined &&
      panchayat_village !== null &&
      String(panchayat_village).trim() !== ""
    ) {
      payload.panchayat_village = String(panchayat_village).trim();
    }

    if (
      panchayat_block !== undefined &&
      panchayat_block !== null &&
      String(panchayat_block).trim() !== ""
    ) {
      payload.panchayat_block = String(panchayat_block).trim();
    }

    if (
      panchayat_district !== undefined &&
      panchayat_district !== null &&
      String(panchayat_district).trim() !== ""
    ) {
      payload.panchayat_district = String(panchayat_district).trim();
    }

    if (
      panchayat_state !== undefined &&
      panchayat_state !== null &&
      String(panchayat_state).trim() !== ""
    ) {
      payload.panchayat_state = String(panchayat_state).trim();
    }

    if (
      panchayat_country !== undefined &&
      panchayat_country !== null &&
      String(panchayat_country).trim() !== ""
    ) {
      payload.panchayat_country = String(panchayat_country).trim();
    }

    if (
      panchayat_latitude !== undefined &&
      panchayat_latitude !== null &&
      String(panchayat_latitude).trim() !== ""
    ) {
      payload.panchayat_latitude = String(panchayat_latitude).trim();
    }

    if (
      panchayat_longitude !== undefined &&
      panchayat_longitude !== null &&
      String(panchayat_longitude).trim() !== ""
    ) {
      payload.panchayat_longitude = String(panchayat_longitude).trim();
    }

    if (
      panchayat_pincode !== undefined &&
      panchayat_pincode !== null &&
      String(panchayat_pincode).trim() !== ""
    ) {
      payload.panchayat_pincode = String(panchayat_pincode).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_update_panchayat_admin(
        :admin_user_id,
        :data::jsonb
      ) AS response
      `,
      {
        admin_user_id: req.user.id,
        data: JSON.stringify(payload),
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

exports.getAllTechniciansForAdmin = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      year,
      month,
      district,
      state,
      latitude,
      longitude,
      radius_km,
      all,
      technician_code,
      technician_status,
      technician_specialization,
      vendor_code,
    } = req.body || {};

    const result = await callSP(
      `
      SELECT public.sp_get_all_technicians_for_admin(
        :page,
        :limit,
        :year,
        :month,
        :district,
        :state,
        :latitude,
        :longitude,
        :radius_km,
        :all,
        :technician_code,
        :technician_status,
        :technician_specialization,
        :vendor_code
      ) AS response
      `,
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,

        year: year ? Number(year) : null,
        month: month ? Number(month) : null,

        district: district && String(district).trim() !== ""
          ? String(district).trim()
          : null,

        state: state && String(state).trim() !== ""
          ? String(state).trim()
          : null,

        latitude: latitude !== undefined && latitude !== null && String(latitude).trim() !== ""
          ? Number(latitude)
          : null,

        longitude: longitude !== undefined && longitude !== null && String(longitude).trim() !== ""
          ? Number(longitude)
          : null,

        radius_km: radius_km !== undefined && radius_km !== null && String(radius_km).trim() !== ""
          ? Number(radius_km)
          : 10,

        all: all && String(all).trim() !== ""
          ? String(all).trim()
          : null,

        technician_code: technician_code && String(technician_code).trim() !== ""
          ? String(technician_code).trim()
          : null,

        technician_status: technician_status && String(technician_status).trim() !== ""
          ? String(technician_status).trim()
          : null,

        technician_specialization:
          technician_specialization && String(technician_specialization).trim() !== ""
            ? String(technician_specialization).trim()
            : null,

        vendor_code: vendor_code && String(vendor_code).trim() !== ""
          ? String(vendor_code).trim()
          : null,
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
//Fetch all devices for Admin

exports.getAllDevicesForAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      year,
      month,
      location,
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

    const parsedLocation =
      location === undefined || location === '' || location === 'All'
        ? null
        : location;

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

    if (parsedYear !== null && (parsedYear < 2000 || parsedYear > 2100)) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 2000 and 2100',
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
      SELECT public.sp_get_all_devices_for_admin(
        :page,
        :limit,
        :year,
        :month,
        :location,
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
        location: parsedLocation,
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