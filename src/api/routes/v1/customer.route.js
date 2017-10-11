const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/customer.controller');
const { authorize, ADMIN, LOGGED_CUSTOMER } = require('../../middlewares/auth');
const {
  listCustomers,
  createCustomer,
  replaceCustomer,
  updateCustomer,
} = require('../../validations/customer.validation');

const router = express.Router();

/**
 * Load customer when API with customerId route parameter is hit
 */
router.param('customerId', controller.load);


router
  .route('/')
  /**
   * @api {get} v1/customers List Customers
   * @apiDescription Get a list of customers
   * @apiVersion 1.0.0
   * @apiName ListCustomers
   * @apiGroup Customer
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Customers per page
   * @apiParam  {String}             [name]       Customer's name
   * @apiParam  {String}             [email]      Customer's email
   * @apiParam  {String=customer,admin}  [role]       Customer's role
   *
   * @apiSuccess {Object[]} customers List of customers.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated customers can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(ADMIN), validate(listCustomers), controller.list)
  /**
   * @api {post} v1/customers Create Customer
   * @apiDescription Create a new customer
   * @apiVersion 1.0.0
   * @apiName CreateCustomer
   * @apiGroup Customer
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {String}             email     Customer's email
   * @apiParam  {String{6..128}}     password  Customer's password
   * @apiParam  {String{..128}}      [name]    Customer's name
   * @apiParam  {String=customer,admin}  [role]    Customer's role
   *
   * @apiSuccess (Created 201) {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess (Created 201) {String}  name       Customer's name
   * @apiSuccess (Created 201) {String}  email      Customer's email
   * @apiSuccess (Created 201) {String}  role       Customer's role
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated customers can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createCustomer), controller.create);


router
  .route('/profile')
  /**
   * @api {get} v1/customers/profile Customer Profile
   * @apiDescription Get logged in customer profile information
   * @apiVersion 1.0.0
   * @apiName CustomerProfile
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  role       Customer's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Customers can access the data
   */
  .get(authorize(), controller.loggedIn);


router
  .route('/:customerId')
  /**
   * @api {get} v1/customers/:id Get Customer
   * @apiDescription Get customer information
   * @apiVersion 1.0.0
   * @apiName GetCustomer
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  role       Customer's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated customers can access the data
   * @apiError (Forbidden 403)    Forbidden    Only customer with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .get(authorize(LOGGED_CUSTOMER), controller.get)
  /**
   * @api {put} v1/customers/:id Replace Customer
   * @apiDescription Replace the whole customer document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceCustomer
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {String}             email     Customer's email
   * @apiParam  {String{6..128}}     password  Customer's password
   * @apiParam  {String{..128}}      [name]    Customer's name
   * @apiParam  {String=customer,admin}  [role]    Customer's role
   * (You must be an admin to change the customer's role)
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  role       Customer's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated customers can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only customer with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .put(authorize(LOGGED_CUSTOMER), validate(replaceCustomer), controller.replace)
  /**
   * @api {patch} v1/customers/:id Update Customer
   * @apiDescription Update some fields of a customer document
   * @apiVersion 1.0.0
   * @apiName UpdateCustomer
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {String}             email     Customer's email
   * @apiParam  {String{6..128}}     password  Customer's password
   * @apiParam  {String{..128}}      [name]    Customer's name
   * @apiParam  {String=customer,admin}  [role]    Customer's role
   * (You must be an admin to change the customer's role)
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {Number}  accountNumber         Customer's accountNumber
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  role       Customer's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated customers can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only customer with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .patch(authorize(LOGGED_CUSTOMER), validate(updateCustomer), controller.update)
  /**
   * @api {patch} v1/customers/:id Delete Customer
   * @apiDescription Delete a customer
   * @apiVersion 1.0.0
   * @apiName DeleteCustomer
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated customers can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only customer with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Customer does not exist
   */
  .delete(authorize(LOGGED_CUSTOMER), controller.remove);


module.exports = router;
