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
    const { call_id, ...data } = req.body;

    if (!call_id) {
      return res.status(400).json({
        success: false,
        message: "call_id is required"
      });
    }

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
    
try{
    const db = getDb();
await db.collection('complaint').updateOne(
      { call_id: String(call_id) },
      {
        $set: { ai_call_conversation }
      }
    );
}catch(mongoErr){
      console.error("Mongo insert failed after retries:", mongoErr.message);

}
    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};
