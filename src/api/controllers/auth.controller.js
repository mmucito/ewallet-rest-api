const httpStatus = require('http-status');
const Customer = require('../models/customer.model');
const RefreshToken = require('../models/refreshToken.model');
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../../config/vars');

/**
* Returns a formated object with tokens
* @private
*/
function generateTokenResponse(customer, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(customer).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType, accessToken, refreshToken, expiresIn,
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const customer = await (new Customer(req.body)).save();
    const customerTransformed = customer.transform();
    const token = generateTokenResponse(customer, customer.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, customer: customerTransformed });
  } catch (error) {
    return next(Customer.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid email and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { customer, accessToken } = await Customer.findAndGenerateToken(req.body);
    const token = generateTokenResponse(customer, accessToken);
    const customerTransformed = customer.transform();
    return res.json({ token, customer: customerTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      customerEmail: email,
      token: refreshToken,
    });
    const { customer, accessToken } = await Customer.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(customer, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
