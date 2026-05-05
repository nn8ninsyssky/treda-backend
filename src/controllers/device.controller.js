const { callSP } = require('../config/db.postgres');

exports.registerDevice = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_register_device(:user_id, :data)`,
      {
        user_id: req.user.id, 
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

// Fetch device, vendor, customer details for complaint raisers



exports.getDeviceFullDetails = async (req, res, next) => {
  try {
    const { device_qr_id } = req.params;

    const result = await callSP(
      `SELECT sp_get_device_full_details(:device_qr_id)`,
      { device_qr_id }
    );

    const response = result?.[0]?.sp_get_device_full_details;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch device details"
      });
    }

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};


//   try {
//     const {
//       page = 1,
//       limit = 10,
//       year,
//       month,
//       location,
//       latitude,
//       longitude,
//       radius_km = 10,
//     } = req.query;

//     const parsedPage = Number(page);
//     const parsedLimit = Number(limit);

//     const parsedYear =
//       year === undefined || year === '' || year === 'All'
//         ? null
//         : Number(year);

//     const parsedMonth =
//       month === undefined || month === '' || month === 'All'
//         ? null
//         : Number(month);

//     const parsedLocation =
//       location === undefined || location === '' || location === 'All'
//         ? null
//         : location;

//     const parsedLatitude =
//       latitude === undefined || latitude === ''
//         ? null
//         : Number(latitude);

//     const parsedLongitude =
//       longitude === undefined || longitude === ''
//         ? null
//         : Number(longitude);

//     const parsedRadius =
//       radius_km === undefined || radius_km === ''
//         ? 10
//         : Number(radius_km);

//     if (Number.isNaN(parsedPage) || parsedPage < 1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid page value',
//       });
//     }

//     if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid limit value',
//       });
//     }

//     if (parsedYear !== null && Number.isNaN(parsedYear)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid year value',
//       });
//     }

//     if (parsedYear !== null && (parsedYear < 2000 || parsedYear > 2100)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Year must be between 2000 and 2100',
//       });
//     }

//     if (parsedMonth !== null && Number.isNaN(parsedMonth)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid month value',
//       });
//     }

//     if (parsedMonth !== null && (parsedMonth < 1 || parsedMonth > 12)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Month must be between 1 and 12',
//       });
//     }

//     if (parsedMonth !== null && parsedYear === null) {
//       return res.status(400).json({
//         success: false,
//         message: 'Year is required when month is provided',
//       });
//     }

//     if (parsedLatitude !== null && Number.isNaN(parsedLatitude)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid latitude value',
//       });
//     }

//     if (parsedLongitude !== null && Number.isNaN(parsedLongitude)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid longitude value',
//       });
//     }

//     if (
//       (parsedLatitude !== null && parsedLongitude === null) ||
//       (parsedLatitude === null && parsedLongitude !== null)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'Both latitude and longitude are required for location filter',
//       });
//     }

//     if (Number.isNaN(parsedRadius) || parsedRadius <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid radius_km value',
//       });
//     }

//     const result = await callSP(
//       `
//       SELECT public.sp_get_all_devices_for_admin(
//         :page,
//         :limit,
//         :year,
//         :month,
//         :location,
//         :latitude,
//         :longitude,
//         :radius_km
//       ) AS response
//       `,
//       {
//         page: parsedPage,
//         limit: parsedLimit,
//         year: parsedYear,
//         month: parsedMonth,
//         location: parsedLocation,
//         latitude: parsedLatitude,
//         longitude: parsedLongitude,
//         radius_km: parsedRadius,
//       }
//     );

//     const response = result[0].response;

//     if (!response.success) {
//       return res.status(400).json(response);
//     }

//     return res.status(200).json(response);
//   } catch (err) {
//     next(err);
//   }
// };