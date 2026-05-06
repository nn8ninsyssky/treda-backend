const { callSP } = require('../config/db.postgres');
const retryMongoInsert = require('../utils/retryMongo');


const { getDb } = require('../config/db.mongo');


exports.insertAICallLog = async (req, res, next) => {
  try {
    const {
      panchayat_code,
      panchayat_partition_month,
      complaint_no,
      ai_call_log_duration_sec,
      ai_call_log_called_at,
      ai_call_log_purpose,
      ai_call_log_status,
      ai_call_conversation,
    } = req.body || {};

    const payload = {};

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

    if (complaint_no !== undefined && complaint_no !== null && String(complaint_no).trim() !== "") {
      payload.complaint_no = String(complaint_no).trim();
    }

    if (
      ai_call_log_duration_sec !== undefined &&
      ai_call_log_duration_sec !== null &&
      String(ai_call_log_duration_sec).trim() !== ""
    ) {
      payload.ai_call_log_duration_sec = String(ai_call_log_duration_sec).trim();
    }

    if (
      ai_call_log_called_at !== undefined &&
      ai_call_log_called_at !== null &&
      String(ai_call_log_called_at).trim() !== ""
    ) {
      payload.ai_call_log_called_at = String(ai_call_log_called_at).trim();
    }

    if (
      ai_call_log_purpose !== undefined &&
      ai_call_log_purpose !== null &&
      String(ai_call_log_purpose).trim() !== ""
    ) {
      payload.ai_call_log_purpose = String(ai_call_log_purpose).trim();
    }

    if (
      ai_call_log_status !== undefined &&
      ai_call_log_status !== null &&
      String(ai_call_log_status).trim() !== ""
    ) {
      payload.ai_call_log_status = String(ai_call_log_status).trim();
    }

    const result = await callSP(
      `
      SELECT public.sp_insert_ai_call_log(
        :data::jsonb
      ) AS response
      `,
      {
        data: JSON.stringify(payload),
      }
    );

    const response = result[0].response;

    if (!response.success) {
      return res.status(400).json(response);
    }

    /*
      Mongo insert is optional.
      Even if Mongo insert fails, PostgreSQL insert response will still be returned.
    */
    try {
      const db = getDb();

      await retryMongoInsert(async () => {
        return db.collection("ai_call_logs").insertOne({
          call_id: response.call_id,
          ai_call_conversation: ai_call_conversation || "",
          created_at: new Date(),
        });
      });
    } catch (mongoErr) {
      console.error("Mongo insert failed after retries:", mongoErr.message);
    }

    return res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};
// update ai call log details remians to fix
exports.updateAiCallLog = async (req, res, next) => {
  try {
    const { call_id, ai_call_conversation, ...data } = req.body;

    if (!call_id) {
      return res.status(400).json({
        success: false,
        message: "call_id is required"
      });
    }

    // 1. PostgreSQL update
    const result = await callSP(
      `SELECT sp_update_ai_call_log(:call_id, :data)`,
      {
        call_id,
        data: JSON.stringify(data)
      }
    );

    const response = result?.[0]?.sp_update_ai_call_log;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // 2. Mongo update
    try {
      const db = getDb();

      const updateData = {};

      if (ai_call_conversation !== undefined) {
        updateData.ai_call_conversation = ai_call_conversation;
      }

      if (Object.keys(updateData).length > 0) {
        const update_call_log = await db.collection('ai_call_logs').updateOne(
          { call_id: String(call_id) },
          { $set: updateData },
          { upsert: true } 
        );
        console.log("Mongo update result:", update_call_log);

        if (update_call_log.matchedCount === 0) {
          console.warn("⚠️ No document found with call_id:", call_id);
        }
      }


    } catch (mongoErr) {
      console.error("Mongo update failed:", mongoErr);
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};

// for getting all ai_call_logs details for admin

exports.getAllAiCallLogsAdmin = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT public.sp_get_all_ai_call_logs_admin(:admin_user_id, :data) AS response`,
      {
        admin_user_id: req.user.id, // from JWT after authenticate middleware
        data: JSON.stringify(req.body || {})
      }
    );

    const response = result[0].response;

    if (!response.success) {
      return res.status(400).json(response);
    }
const logs = response.data || [];

    // 2. Get Mongo DB instance
    const db = getDb();

    // 3. Extract all call_ids
    const callIds = logs.map(log => String(log.call_id));

    // 4. Fetch conversations from Mongo
    const conversations = await db.collection('ai_call_logs')
      .find({ call_id: { $in: callIds } })
      .toArray();

    // 5. Convert to map for fast lookup
    const conversationMap = {};
    conversations.forEach(doc => {
      conversationMap[doc.call_id] = doc.ai_call_conversation;
    });

    // 6. Merge Postgres + Mongo
    const finalData = logs.map(log => ({
      ...log,
      ai_call_conversation: conversationMap[String(log.call_id)] || []
    }));

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};