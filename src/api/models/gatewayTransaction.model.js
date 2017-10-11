const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');


/**
 * Gateway Transaction Schema
 * @private
 */
const gatewayTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    default: 0,
    required: true,
  },
  authorizationCode: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
gatewayTransactionSchema.method({
  transform() {
    const transformed = {};
    const fields = ['transactionId', 'status', 'paymentDate', 'amount', 'authorizationCode'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});


module.exports = mongoose.model('GatewayTransaction', gatewayTransactionSchema);