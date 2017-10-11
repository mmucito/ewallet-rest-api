const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment-timezone');
const GatewayTransaction = require('../models/gatewayTransaction.model');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');

async function sleep(ms){
    return new Promise(r => setTimeout(r, ms));
}

async function simulateGatewayCall(card, amount) {
    await sleep(3000);
    
    let status = 'success';
    if(card === '4242424242424242'){
        status = 'failure';
    }

    const hex = crypto.randomBytes(Math.ceil(6/2))
    .toString('hex')
    .slice(0,6);
    const auth_code = parseInt(hex, 16);

    return {
        'transactionId': uuidv4(),
        'status': status,
        'paymentDate': moment(),
        'amount': amount,
        'authorizationCode': auth_code,
    };
}

exports.debitCard = async (card, amount) => {
    const gatewayResponse = await simulateGatewayCall(card, amount);
    const gatewayTransaction = new GatewayTransaction(gatewayResponse);
    const savedGatewayTransaction = await gatewayTransaction.save();
    if(savedGatewayTransaction.status === 'failure'){
        throw new APIError({
            message: 'Payment Rejected',
            status: httpStatus.PAYMENT_REQUIRED,
          });
    }
    return savedGatewayTransaction.transform();
    
  };