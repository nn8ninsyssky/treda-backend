const { callSP } = require('../config/db.postgres');
const retryMongoInsert = require('../utils/retryMongo');


const { getDb } = require('../config/db.mongo');

exports.insertAiCallLog = async (req, res, next) => {
  try {
    const {
      customer_id,
      complaint_id,
      duration,
      called_at,
      purpose,
      status,
      ai_call_conversation
    } = req.body;

    const result = await callSP(
      `SELECT sp_insert_ai_call_log(:data)`,
      {
        data: JSON.stringify(
          {
            customer_id: customer_id || null,
            complaint_id: complaint_id || null,
            duration,
            called_at,
            purpose,
            status
          }
        )
      }
    );

    const response = result?.[0]?.sp_insert_ai_call_log;

    if (!response?.success) {
      return res.status(400).json(response);
    }

    // 2. Mongo insert with retry
    try {
      const db = getDb();

      await retryMongoInsert(async () => {
        return db.collection('ai_call_logs').insertOne({
          call_id: response.call_id,
          ai_call_conversation: ai_call_conversation || "",

        });
      });

    } catch (mongoErr) {
      console.error("Mongo insert failed after retries:", mongoErr.message);
      // DO NOT fail API
    }


    return res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};

// update ai call log details
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
          { upsert: false } // optional
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
