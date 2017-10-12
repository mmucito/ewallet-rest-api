const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment-timezone');
const GatewayTransaction = require('../models/gatewayTransaction.model');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');

exports.transfer = async (accountNumber, amount, destinationAccountNumber) => {
    const reference = uuidv4();

    const transaction = new Transaction();
    transaction.amount = -amount;
    transaction.operation = 'transfer';
    transaction.accountNumber = accountNumber;
    transaction.destinationAccountNumber = destinationAccountNumber;
    transaction.reference = 'transfer_to_account:' + destinationAccountNumber;
    const savedTransaction = await transaction.save();
    const savedCustomer = await Customer.findOne({ 'accountNumber': accountNumber });

    const transactionBeneficiary = new Transaction();
    transactionBeneficiary.amount = amount;
    transactionBeneficiary.operation = 'transfer';
    transactionBeneficiary.accountNumber = destinationAccountNumber;
    transactionBeneficiary.reference = 'transfer_from_account:' + accountNumber;
    const savedTransactionBeneficiary = await transactionBeneficiary.save();

    const response = { transaction: transaction.transform(), customer: savedCustomer.transformBalance() }
    
    return response;
  };