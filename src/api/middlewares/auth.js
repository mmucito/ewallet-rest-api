const httpStatus = require('http-status');
const passport = require('passport');
const Customer = require('../models/customer.model');
const APIError = require('../utils/APIError');

const ADMIN = 'admin';
const LOGGED_CUSTOMER = '_loggedCustomer';

const handleJWT = (req, res, next, roles) => async (err, customer, info) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !customer) throw error;
    await logIn(customer, { session: false });
  } catch (e) {
    return next(apiError);
  }

  if (roles === LOGGED_CUSTOMER) {
    if (customer.role !== 'admin' && req.params.customerId !== customer._id.toString()) {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = 'Forbidden';
      return next(apiError);
    }
  } else if (!roles.includes(customer.role)) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  } else if (err || !customer) {
    return next(apiError);
  }

  req.customer = customer;

  return next();
};

exports.ADMIN = ADMIN;
exports.LOGGED_CUSTOMER = LOGGED_CUSTOMER;

exports.authorize = (roles = Customer.roles) => (req, res, next) =>
  passport.authenticate(
    'jwt', { session: false },
    handleJWT(req, res, next, roles),
  )(req, res, next);