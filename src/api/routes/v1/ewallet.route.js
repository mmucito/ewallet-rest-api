const express = require('express');
const validate = require('express-validation');
const controllerWallet = require('../../controllers/ewallet.controller');
const { authorize, ADMIN, LOGGED_CUSTOMER } = require('../../middlewares/auth');
const {
  listCustomers,
  walletDeposit,
  walletTransfer,
  createCustomer,
  replaceCustomer,
  updateCustomer,
} = require('../../validations/customer.validation');

const router = express.Router();

router
  .route('/balance')
  /**
   * @api {get} v1/ewallet/balance Get Customer Balance
   * @apiDescription Get customer balance information
   * @apiVersion 1.0.0
   * @apiName GetBalance
   * @apiGroup eWallet
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  role       Customer's role
   * @apiSuccess {String}  balance    Customer's balance
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated customers can access the data
   * @apiError (Forbidden 403)    Forbidden    Only customer with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .get(authorize(), controllerWallet.getBalance);

router
  .route('/transactions')
  /**
   * @api {get} v1/ewallet/transactions Get Customer Balance
   * @apiDescription Get customer balance information
   * @apiVersion 1.0.0
   * @apiName GetBalance
   * @apiGroup eWallet
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  role       Customer's role
   * @apiSuccess {String}  balance    Customer's balance
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated customers can access the data
   * @apiError (Forbidden 403)    Forbidden    Only customer with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .get(authorize(), controllerWallet.getTransactions);

router
  .route('/deposit')
  /**
   * @api {post} v1/ewallet/deposit eWallet Deposit
   * @apiDescription Make a deposit to the Customer's Account
   * @apiVersion 1.0.0
   * @apiName Deposit
   * @apiGroup eWallet
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {Number{0...50000}}       amount       Decimal whith two fraction digits.
   * @apiParam  {String}             card  A valid credit card number.
   *
   * @apiSuccess {Object}  transaction       Transaction.
   * @apiSuccess  {String}  transaction.id     Transaction's id
   * @apiSuccess  {Number}  transaction.accountNumber   Transaction's accountNumber
   * @apiSuccess  {Number}  transaction.destinationAccountNumber   Transaction's destinationAccountNumber
   * @apiSuccess  {String}  transaction.operation  Transaction's type of operation (deposit, withdrawal, transfer, fee)
   * @apiSuccess  {Number}  transaction.amount     Transaction's amount
   * @apiSuccess  {Number}  transaction.reference     Transaction's reference
   * @apiSuccess  {Date}    transaction.createdAt      Timestamp
   *
   * @apiSuccess {Object}  customer       Customer.
   * @apiSuccess  {String}  customer.id             Customer's id
   * @apiSuccess  {Number}  customer.accountNumber  Customer's accountNumber
   * @apiSuccess  {String}  customer.name           Customer's name
   * @apiSuccess  {String}  customer.email          Customer's email
   * @apiSuccess  {String}  customer.role           Customer's role
   * @apiSuccess  {Date}    customer.createdAt      Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated customers can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(), validate(walletDeposit), controllerWallet.deposit);

router
  .route('/transfer')
  /**
   * @api {post} v1/ewallet/transfer eWallet Transfer
   * @apiDescription Make a transfer to another eWallet
   * @apiVersion 1.0.0
   * @apiName Transfer
   * @apiGroup eWallet
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization Customer's access token
   *
   * @apiParam  {Number{0...50000}}       amount       Decimal whith two fraction digits.
   * @apiParam  {Number}             destinationAccountNumber  Transaction's destinationAccountNumber
   *
   * @apiSuccess {Object}  transaction       Transaction.
   * @apiSuccess  {String}  transaction.id     Transaction's id
   * @apiSuccess  {Number}  transaction.accountNumber   Transaction's accountNumber
   * @apiSuccess  {Number}  transaction.destinationAccountNumber   Transaction's destinationAccountNumber
   * @apiSuccess  {String}  transaction.operation  Transaction's type of operation (deposit, withdrawal, transfer, fee)
   * @apiSuccess  {Number}  transaction.amount     Transaction's amount
   * @apiSuccess  {Number}  transaction.reference     Transaction's reference
   * @apiSuccess  {Date}    transaction.createdAt      Timestamp
   *
   * @apiSuccess {Object}  customer       Customer.
   * @apiSuccess  {String}  customer.id             Customer's id
   * @apiSuccess  {Number}  customer.accountNumber  Customer's accountNumber
   * @apiSuccess  {String}  customer.name           Customer's name
   * @apiSuccess  {String}  customer.email          Customer's email
   * @apiSuccess  {String}  customer.role           Customer's role
   * @apiSuccess  {Date}    customer.createdAt      Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated customers can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(), validate(walletTransfer), controllerWallet.transfer);

  router
  .route('/withdrawal')
  /**
   * @api {post} v1/ewallet/withdrawal eWallet Withdrawal
   * @apiDescription Triggers a Debit Cards withdrawal from your account. These withdrawals are immediate during banking hours for some banks 
   * @apiVersion 1.0.0
   * @apiName Withdrawal
   * @apiGroup eWallet
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization Customer's access token
   *
   * @apiParam  {Number{0...50000}}       amount       The amount to withdraw from your account
   * @apiParam  {String}             card  The debit card number where the funds will be sent to
   *
   * @apiSuccess {Object}  transaction       Transaction.
   * @apiSuccess  {String}  transaction.id     Transaction's id
   * @apiSuccess  {Number}  transaction.accountNumber   Transaction's accountNumber
   * @apiSuccess  {Number}  transaction.destinationAccountNumber   Transaction's destinationAccountNumber
   * @apiSuccess  {String}  transaction.operation  Transaction's type of operation (deposit, withdrawal, transfer, fee)
   * @apiSuccess  {Number}  transaction.amount     Transaction's amount
   * @apiSuccess  {Number}  transaction.reference     Transaction's reference
   * @apiSuccess  {Date}    transaction.createdAt      Timestamp
   *
   * @apiSuccess {Object}  customer       Customer.
   * @apiSuccess  {String}  customer.id             Customer's id
   * @apiSuccess  {Number}  customer.accountNumber  Customer's accountNumber
   * @apiSuccess  {String}  customer.name           Customer's name
   * @apiSuccess  {String}  customer.email          Customer's email
   * @apiSuccess  {String}  customer.role           Customer's role
   * @apiSuccess  {Date}    customer.createdAt      Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated customers can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(), validate(walletDeposit), controllerWallet.withdrawal);
module.exports = router;
