const httpStatus = require('http-status');
const { omit } = require('lodash');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const paymentService = require('../services/paymentService');
const withdrawalService = require('../services/withdrawalService');
const transferService = require('../services/transferService');
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
 * eWallet Deposit
 * @public
 */
exports.deposit = async (req, res, next) => {
  try {
    const paymentResponse = await paymentService.debitCard(req.customer.accountNumber, req.body.card, req.body.amount);        
    res.json(paymentResponse);    
    
  } catch (error) {
    next(error);
  }
};

/**
 * eWallet Transfer
 * @public
 */
exports.transfer = async (req, res, next) => {
  try {    
    const transferResponse = await transferService.transfer(req.customer.accountNumber, req.body.amount, req.body.destinationAccountNumber);    
    res.json(transferResponse);    
    
  } catch (error) {
    next(error);
  }
};

/**
 * eWallet Withdrawal
 * @public
 */
exports.withdrawal = async (req, res, next) => {
  try {
    const withdrawalResponse = await withdrawalService.withdrawal(req.customer.accountNumber, req.body.card, req.body.amount);        
    res.json(withdrawalResponse);    
    
  } catch (error) {
    next(error);
  }
};