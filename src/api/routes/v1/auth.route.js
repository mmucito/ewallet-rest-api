const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/auth.controller');
const {
  login,
  register,
  refresh,
} = require('../../validations/auth.validation');

const router = express.Router();

/**
 * @api {post} v1/auth/register Register
 * @apiDescription Register a new customer
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}          email     Customer's email
 * @apiParam  {String{6..128}}  password  Customer's password
 * @apiParam  {String{..128}}  [name]    Customer's name
 *
 * @apiSuccess (Created 201) {String}  token.tokenType     Access Token's type
 * @apiSuccess (Created 201) {String}  token.accessToken   Authorization Token
 * @apiSuccess (Created 201) {String}  token.refreshToken  Token to get a new accessToken
 *                                                   after expiration time
 * @apiSuccess (Created 201) {Number}  token.expiresIn     Access Token's expiration time
 *                                                   in miliseconds
 * @apiSuccess (Created 201) {String}  token.timezone      The server's Timezone
 *
 * @apiSuccess (Created 201) {String}  customer.id         Customer's id
 * @apiSuccess (Created 201) {Number}  customer.accountNumber         Customer's accountNumber
 * @apiSuccess (Created 201) {String}  customer.name       Customer's name
 * @apiSuccess (Created 201) {String}  customer.email      Customer's email
 * @apiSuccess (Created 201) {String}  customer.role       Customer's role
 * @apiSuccess (Created 201) {Date}    customer.createdAt  Timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 */
router.route('/register')
  .post(validate(register), controller.register);


/**
 * @api {post} v1/auth/login Login
 * @apiDescription Get an accessToken
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     Customer's email
 * @apiParam  {String{..128}}  password  Customer's password
 *
 * @apiSuccess  {String}  token.tokenType     Access Token's type
 * @apiSuccess  {String}  token.accessToken   Authorization Token
 * @apiSuccess  {String}  token.refreshToken  Token to get a new accessToken
 *                                                   after expiration time
 * @apiSuccess  {Number}  token.expiresIn     Access Token's expiration time
 *                                                   in miliseconds
 *
 * @apiSuccess  {String}  customer.id             Customer's id
 * @apiSuccess  {Number}  customer.accountNumber  Customer's accountNumber
 * @apiSuccess  {String}  customer.name           Customer's name
 * @apiSuccess  {String}  customer.email          Customer's email
 * @apiSuccess  {String}  customer.role           Customer's role
 * @apiSuccess  {Date}    customer.createdAt      Timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or password
 */
router.route('/login')
  .post(validate(login), controller.login);


/**
 * @api {post} v1/auth/refresh-token Refresh Token
 * @apiDescription Refresh expired accessToken
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  email         Customer's email
 * @apiParam  {String}  refreshToken  Refresh token aquired when customer logged in
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or refreshToken
 */
router.route('/refresh-token')
  .post(validate(refresh), controller.refresh);


/**
 * TODO: POST /v1/auth/reset-password
 */


module.exports = router;
