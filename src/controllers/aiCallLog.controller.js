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
        data: {
          customer_id: customer_id || null,
          complaint_id: complaint_id || null,
          duration,
          called_at,
          purpose,
          status
        }
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


