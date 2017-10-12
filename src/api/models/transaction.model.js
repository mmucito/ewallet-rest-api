const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');
const { omitBy, isNil } = require('lodash');
const Customer = require('../models/customer.model');
const { masterAccount, masterAccountPassword } = require('../../config/vars');

/**
* Indicates type of operation
*/
const operations = ['deposit', 'withdrawal', 'transfer', 'fee'];

/**
 * Transaction Schema
 * @private
 */
const transactionSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true,
    enum: operations,
  },
  accountNumber: {
    type: 'Number',
    ref: 'Customer',
    required: true,
  },
  destinationAccountNumber: {
    type: 'Number',
    ref: 'Customer'
  },
  amount: {
    type: Number,
    default: 0,
    required: true,
  },
  reference: {
    type: String,
  },
}, {
  timestamps: true,
});




/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

transactionSchema.pre('save', async function save(next) {
  this.wasNew = this.isNew;
  return next();
});


transactionSchema.post('save', async function save(doc, next) {
  try{
    if(this.wasNew){
      const currentCustomer = await Customer.findOne({ 'accountNumber': this.accountNumber });      
      currentCustomer.balance += this.amount;
      currentCustomer.balance = currentCustomer.balance.toFixed(2);      
      const savedCustomer = await currentCustomer.save();     
      
    }


    if(this.wasNew && this.operation === 'transfer' && this.amount < 0){
      let fee = 0;
      let tempAmount = Math.abs(this.amount);

      if(tempAmount <= 1000){
        fee = 8 + (tempAmount * 0.03);
      }else if(tempAmount > 1000 && tempAmount <= 5000){
        fee = 6 + (tempAmount * 0.025);
      }else if(tempAmount > 5000 && tempAmount <= 10000){
        fee = 4 + (tempAmount * 0.02);
      }else if(tempAmount > 10000){
        fee = 3 + (tempAmount * 0.01);
      }
      

      if(fee > 0){
        const transFee = new Transaction();
        transFee.amount = -fee;
        transFee.amount = transFee.amount.toFixed(2);
        transFee.operation = 'fee';
        transFee.accountNumber = this.accountNumber;
        transFee.reference = 'fee_from_transaction:' + this._id;
        const savedTransFee = await transFee.save();

        const masterAccount = await Customer.getMasterAccount();   
        masterAccount.balance -= savedTransFee.amount;
        const savedMasterAccount = await masterAccount.save();

      }

    }

    return next();
  } catch (error) {
    return next(error);
  }

});

/**
 * Methods
 */
transactionSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'accountNumber', 'destinationAccountNumber', 'operation', 'amount', 'reference', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});


/**
 * Statics
 */
transactionSchema.statics = { 
    /**
     * List customers transactions in descending order of 'createdAt' timestamp.
     *
     * @param {number} skip - Number of transactions to be skipped.
     * @param {number} limit - Limit number of transactions to be returned.
     * @returns {Promise<Transaction[]>}
     */
    list({
      page = 1, perPage = 30, accountNumber,
    }) {
      let options = omitBy({ accountNumber }, isNil);
      if (accountNumber == masterAccount){
        options = {operation: 'fee'};
      }
  
      return this.find(options)
        .sort({ createdAt: -1 })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
    },
  
    
  };

  const Transaction = mongoose.model('Transaction', transactionSchema);
  
module.exports = Transaction;