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

// For Technician Update by Vendor

exports.updateMyTechnicianByVendor = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_update_technician_by_admin(:user_id, :data)`,
      {
        user_id: req.params.user_id, 
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_update_technician_by_admin;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }
};

// for getting panchayat by vendor
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
// For getting all Technicians Data

exports.getTechniciansByVendor = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      all,
      year,
      month,
      technician_village,
      technician_district,
      technician_pincode,
      technician_specialization,
      technician_latitude,
      technician_longitude,
      technician_status,
      technician_code,
    } = req.body || {};

    const payload = {};

    if (page !== undefined && page !== null && String(page).trim() !== "") {
      payload.page = Number(page);
    }

    if (limit !== undefined && limit !== null && String(limit).trim() !== "") {
      payload.limit = Number(limit);
    }

    if (all !== undefined && all !== null && String(all).trim() !== "") {
      payload.all = String(all).trim();
    }

    if (year !== undefined && year !== null && String(year).trim() !== "") {
      payload.year = Number(year);
    }

    if (month !== undefined && month !== null && String(month).trim() !== "") {
      payload.month = Number(month);
    }

    if (
      technician_village !== undefined &&
      technician_village !== null &&
      String(technician_village).trim() !== ""
    ) {
      payload.technician_village = String(technician_village).trim();
    }

    if (
      technician_district !== undefined &&
      technician_district !== null &&
      String(technician_district).trim() !== ""
    ) {
      payload.technician_district = String(technician_district).trim();
    }

    if (
      technician_pincode !== undefined &&
      technician_pincode !== null &&
      String(technician_pincode).trim() !== ""
    ) {
      payload.technician_pincode = String(technician_pincode).trim();
    }

    if (
      technician_specialization !== undefined &&
      technician_specialization !== null &&
      String(technician_specialization).trim() !== ""
    ) {
      payload.technician_specialization = String(technician_specialization).trim();
    }

    if (
      technician_latitude !== undefined &&
      technician_latitude !== null &&
      String(technician_latitude).trim() !== ""
    ) {
      payload.technician_latitude = String(technician_latitude).trim();
    }

    if (
      technician_longitude !== undefined &&
      technician_longitude !== null &&
      String(technician_longitude).trim() !== ""
    ) {
      payload.technician_longitude = String(technician_longitude).trim();
    }

    if (
      technician_status !== undefined &&
      technician_status !== null &&
      String(technician_status).trim() !== ""
    ) {
      payload.technician_status = String(technician_status).trim();
    }

    if (
      technician_code !== undefined &&
      technician_code !== null &&
      String(technician_code).trim() !== ""
    ) {
      payload.technician_code = String(technician_code).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_get_technicians_by_vendor(
        :vendor_user_id,
        :data::jsonb
      ) AS response
      `,
      {
        vendor_user_id: req.user.id,
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
// For getting all devices under logged in vendor
exports.getAllDevicesForVendor = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      all,
      year,
      month,
      device_name,
      device_latitude,
      device_longitude,
      device_location,
      device_category,
      device_qr_id,
      panchayat_code,
      vendor_code
    } = req.body || {};

    const payload = {};

    if (page !== undefined && page !== null && String(page).trim() !== "") {
      payload.page = Number(page);
    }

    if (limit !== undefined && limit !== null && String(limit).trim() !== "") {
      payload.limit = Number(limit);
    }

    if (all !== undefined && all !== null && String(all).trim() !== "") {
      payload.all = String(all).trim();
    }

    if (year !== undefined && year !== null && String(year).trim() !== "") {
      payload.year = Number(year);
    }

    if (month !== undefined && month !== null && String(month).trim() !== "") {
      payload.month = Number(month);
    }

    if (device_name !== undefined && device_name !== null && String(device_name).trim() !== "") {
      payload.device_name = String(device_name).trim();
    }

    if (
      device_latitude !== undefined &&
      device_latitude !== null &&
      String(device_latitude).trim() !== ""
    ) {
      payload.device_latitude = String(device_latitude).trim();
    }

    if (
      device_longitude !== undefined &&
      device_longitude !== null &&
      String(device_longitude).trim() !== ""
    ) {
      payload.device_longitude = String(device_longitude).trim();
    }

    if (device_location !== undefined && device_location !== null && String(device_location).trim() !== "") {
      payload.device_location = String(device_location).trim();
    }

    if (device_category !== undefined && device_category !== null && String(device_category).trim() !== "") {
      payload.device_category = String(device_category).trim();
    }

    if (device_qr_id !== undefined && device_qr_id !== null && String(device_qr_id).trim() !== "") {
      payload.device_qr_id = String(device_qr_id).trim();
    }

    if (panchayat_code !== undefined && panchayat_code !== null && String(panchayat_code).trim() !== "") {
      payload.panchayat_code = String(panchayat_code).trim();
    }

    if (vendor_code !== undefined && vendor_code !== null && String(vendor_code).trim() !== "") {
      payload.vendor_code = String(vendor_code).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_get_devices_by_vendor(
        :vendor_user_id,
        :data::jsonb
      ) AS response
      `,
      {
        vendor_user_id: req.user.id,
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

// Update devices details by vendor
exports.updateDeviceByVendor = async (req, res, next) => {
  try {
    const { device_id } = req.params;

    const {
      device_name,
      device_location,
      device_category,
      device_latitude,
      device_longitude,
      device_qr_id,
      device_partition_month,
      panchayat_code,
      panchayat_partition_month,
    } = req.body || {};

    const payload = {};

    if (device_name !== undefined && device_name !== null && String(device_name).trim() !== "") {
      payload.device_name = String(device_name).trim();
    }

    if (device_location !== undefined && device_location !== null && String(device_location).trim() !== "") {
      payload.device_location = String(device_location).trim();
    }

    if (device_category !== undefined && device_category !== null && String(device_category).trim() !== "") {
      payload.device_category = String(device_category).trim();
    }

    if (
      device_latitude !== undefined &&
      device_latitude !== null &&
      String(device_latitude).trim() !== ""
    ) {
      payload.device_latitude = String(device_latitude).trim();
    }

    if (
      device_longitude !== undefined &&
      device_longitude !== null &&
      String(device_longitude).trim() !== ""
    ) {
      payload.device_longitude = String(device_longitude).trim();
    }

    if (device_qr_id !== undefined && device_qr_id !== null && String(device_qr_id).trim() !== "") {
      payload.device_qr_id = String(device_qr_id).trim();
    }

    if (
      device_partition_month !== undefined &&
      device_partition_month !== null &&
      String(device_partition_month).trim() !== ""
    ) {
      payload.device_partition_month = String(device_partition_month).trim();
    }

    if (panchayat_code !== undefined && panchayat_code !== null && String(panchayat_code).trim() !== "") {
      payload.panchayat_code = String(panchayat_code).trim();
    }

    if (
      panchayat_partition_month !== undefined &&
      panchayat_partition_month !== null &&
      String(panchayat_partition_month).trim() !== ""
    ) {
      payload.panchayat_partition_month = String(panchayat_partition_month).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_update_device_by_vendor(
        :user_id,
        :device_id,
        :data::jsonb
      ) AS response
      `,
      {
        user_id: req.user.id,
        device_id,
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