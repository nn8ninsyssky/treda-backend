const { Complaint }      = require('../models/pg');
const { ComplaintDetail } = require('../models/mongo');
const { v4: uuidv4 }     = require('uuid');

const createComplaint = async (data) => {
  const complaint_id = uuidv4();

  // Step 1 — write structured fields to PostgreSQL
  const pgComplaint = await Complaint.create({
    complaint_id,
    customer_id:  data.customer_id,
    complaint_type:     data.type,
    complaint_priority: data.priority,
    complaint_status:   'open',
  });

  // Step 2 — write free-text fields to MongoDB using same UUID
  await ComplaintDetail.create({
    complaint_id,                    // ← same UUID, links the two records
    customer_id:  data.customer_id,
    description:  data.description,
  });

  return pgComplaint;
};

// Example: fetch complaint + merge both sources
const getComplaintById = async (complaint_id) => {
  const [pgData, mongoData] = await Promise.all([
    Complaint.findByPk(complaint_id),
    ComplaintDetail.findOne({ complaint_id }),
  ]);

  if (!pgData) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }

  // Merge both into one response object
  return {
    ...pgData.toJSON(),
    description:      mongoData?.description      || null,
    resolution_notes: mongoData?.resolution_notes || null,
    visit_notes:      mongoData?.visit_notes      || null,
    visit_log:        mongoData?.visit_log        || [],
  };
};

async function createComplaint(data){
  const complaint= await pg.insert("complaints",data);
  await mongo.insert("complaint_logs",{
    complaintId:complaint.id,
    complaint_description:data.longText,
    complaint_resolution_notes:data.notes,
    complaint_visit_notes:data.visit_notes,
  });
  await sendNotification();
  return complaint;
}