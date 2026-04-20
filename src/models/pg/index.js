const { sequelize } = require('../../config/db.postgres');

const User = require('./User');
const Customer = require('./Customer');

// ✅ Only required association for now
User.hasOne(Customer, {
  foreignKey: 'user_id',
  as: 'customer'
});

Customer.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Customer
};