
const { callSP } = require('../config/db.postgres');

exports.getMyPanchayat = async (req, res, next) => {
  try {
    const result = await callSP(
      `
      SELECT public.sp_get_panchayat_by_user_id(
        :user_id
      ) AS response
      `,
      {
        user_id: req.user.id,
      }
    );

    const response = result[0].response;

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

exports.updateMyPanchayat = async (req, res, next) => {
  try {
    const {
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
      SELECT public.sp_update_panchayat(
        :user_id,
        :data::jsonb
      ) AS response
      `,
      {
        user_id: req.user.id,
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
exports.getDevicesByPanchayat = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      all,
      year,
      month,
      latitude,
      longitude,
      radius_km,
      device_category,
      panchayat_code,
      device_qr_id,
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
      latitude !== undefined &&
      latitude !== null &&
      String(latitude).trim() !== ""
    ) {
      payload.latitude = String(latitude).trim();
    }

    if (
      longitude !== undefined &&
      longitude !== null &&
      String(longitude).trim() !== ""
    ) {
      payload.longitude = String(longitude).trim();
    }

    if (
      radius_km !== undefined &&
      radius_km !== null &&
      String(radius_km).trim() !== ""
    ) {
      payload.radius_km = String(radius_km).trim();
    }

    if (
      device_category !== undefined &&
      device_category !== null &&
      String(device_category).trim() !== ""
    ) {
      payload.device_category = String(device_category).trim();
    }

    if (
      panchayat_code !== undefined &&
      panchayat_code !== null &&
      String(panchayat_code).trim() !== ""
    ) {
      payload.panchayat_code = String(panchayat_code).trim();
    }

    if (
      device_qr_id !== undefined &&
      device_qr_id !== null &&
      String(device_qr_id).trim() !== ""
    ) {
      payload.device_qr_id = String(device_qr_id).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_get_devices_by_panchayat(
        :panchayat_user_id::uuid,
        :data::jsonb
      ) AS response
      `,
      {
        panchayat_user_id: req.user.id,
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

//Fecth all vendors from which customer had taken devices
exports.getLinkedVendorsByPanchayat = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      all,
      vendor_code,
      district,
      latitude,
      longitude,
      radius_km,
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

    if (
      vendor_code !== undefined &&
      vendor_code !== null &&
      String(vendor_code).trim() !== ""
    ) {
      payload.vendor_code = String(vendor_code).trim();
    }

    if (
      district !== undefined &&
      district !== null &&
      String(district).trim() !== ""
    ) {
      payload.district = String(district).trim();
    }

    if (
      latitude !== undefined &&
      latitude !== null &&
      String(latitude).trim() !== ""
    ) {
      payload.latitude = String(latitude).trim();
    }

    if (
      longitude !== undefined &&
      longitude !== null &&
      String(longitude).trim() !== ""
    ) {
      payload.longitude = String(longitude).trim();
    }

    if (
      radius_km !== undefined &&
      radius_km !== null &&
      String(radius_km).trim() !== ""
    ) {
      payload.radius_km = String(radius_km).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_get_vendors_by_panchayat(
        :panchayat_user_id::uuid,
        :data::jsonb
      ) AS response
      `,
      {
        panchayat_user_id: req.user.id,
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