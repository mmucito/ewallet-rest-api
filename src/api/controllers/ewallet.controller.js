const httpStatus = require('http-status');
const { omit } = require('lodash');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const paymentService = require('../services/paymentService');
const { handler: errorHandler } = require('../middlewares/error');


/**
 * Get customer balance
 * @public
 */
exports.getBalance = (req, res) => res.json(req.customer.transformBalance());

/**
 * Get customer transactions
 * @public
 */
exports.getTransactions = async (req, res, next) => {
  try {
    req.query.accountNumber = req.customer.accountNumber;
    const transactions = await Transaction.list(req.query);
    const transformedTransactions = transactions.map(transaction => transaction.transform());
    res.json(transformedTransactions);
  } catch (error) {
    next(error);
  }
};

/**
 * Wallet Deposit
 * @public
 */
exports.deposit = async (req, res, next) => {
  try {

    const paymentResponse = await paymentService.debitCard(req.body.card, req.body.amount);

    const transaction = new Transaction();
    transaction.amount = req.body.amount;
    transaction.operation = 'deposit';
    transaction.accountNumber = req.customer.accountNumber;
    transaction.reference = "gatewayTransaction_"+paymentResponse.transactionId;
    const savedTransaction = await transaction.save();
    const savedCustomer = await Customer.findById(req.customer._id);
    const response = { transaction: savedTransaction.transform(), customer: savedCustomer.transformBalance() }    
    res.json(response);
    
    
  } catch (error) {
    next(error);
  }
};
