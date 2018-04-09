/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../index');
const Customer = require('../../models/customer.model');
const Transaction = require('../../models/transaction.model');
const JWT_EXPIRATION = require('../../../config/vars').jwtExpirationInterval;

/**
 * root level hooks
 */

async function format(customer) {
  const formated = customer;

  // delete password
  delete formated.password;

  // get customers from database
  const dbCustomer = (await Customer.findOne({ email: customer.email })).transform();

  // remove null and undefined properties
  return omitBy(dbCustomer, isNil);
}

describe('eWallet API', async () => {
  let adminAccessToken;
  let customerAccessToken;
  let dbCustomers;
  let customer;
  let admin;

  const password = '123456';
  const passwordHashed = await bcrypt.hash(password, 1);

  beforeEach(async () => {
    dbCustomers = {
      masterAccount: {
        email: 'master_account@bank.com',
        password: passwordHashed,
        name: 'Master Account',
        accountNumber: 1000,
        role: 'admin',
      },
      mmucito: {
        email: 'martin.mucito@gmail.com',
        password,
        balance: 500,
        accountNumber: 1001,
        name: 'Martín Mucito',
      },
      jhonDoe: {
        email: 'jhondoe@gmail.com',
        password: passwordHashed,
        balance: 10000,
        accountNumber: 1003,
        name: 'Jhon Doe',
      },
    };

    customer = {
      email: 'usertesting2@gmail.com',
      password,
      accountNumber: 1002,
      name: 'User Testing',
    };

    admin = {
      email: 'master_account2@bank.com',
      password,
      name: 'Master Account Testing',
      accountNumber: 999,
      role: 'admin',
    };

    await Customer.remove({});
    await Transaction.remove({});
    await Customer.insertMany([dbCustomers.masterAccount, dbCustomers.jhonDoe, dbCustomers.mmucito]);
    dbCustomers.masterAccount.password = password;
    dbCustomers.jhonDoe.password = password;
    adminAccessToken = (await Customer.findAndGenerateToken(dbCustomers.masterAccount)).accessToken;
    customerAccessToken = (await Customer.findAndGenerateToken(dbCustomers.jhonDoe)).accessToken;
  });

  describe('POST /v1/customers', () => {
    it('should create a new customer when request is ok', () => {
      return request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(admin)
        .expect(httpStatus.CREATED)
        .then((res) => {
          delete admin.password;
          expect(res.body).to.include(admin);
        });
    });

    it('should create a new customer and set default role to "customer"', () => {
      return request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.role).to.be.equal('customer');
        });
    });

    it('should report error when email already exists', () => {
      customer.email = dbCustomers.masterAccount.email;

      return request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" already exists');
        });
    });

    it('should report error when email is not provided', () => {
      delete customer.email;

      return request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" is required');
        });
    });

    it('should report error when password length is less than 6', () => {
      customer.password = '12345';

      return request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('password');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"password" length must be at least 6 characters long');
        });
    });

    it('should report error when logged customer is not an admin', () => {
      return request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(customer)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/customers', () => {
    it('should get all customers', () => {
      return request(app)
        .get('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const bran = format(dbCustomers.masterAccount);
          const john = format(dbCustomers.jhonDoe);

          const includesmasterAccount = some(res.body, bran);
          const includesjhonDoe = some(res.body, john);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);
          res.body[1].createdAt = new Date(res.body[1].createdAt);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(3);
          expect(includesmasterAccount).to.be.true;
          expect(includesjhonDoe).to.be.true;
        });
    });

    it('should get all customers with pagination', () => {
      return request(app)
        .get('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, perPage: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          delete dbCustomers.jhonDoe.password;
          const john = format(dbCustomers.jhonDoe);
          const includesjhonDoe = some(res.body, john);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesjhonDoe).to.be.true;
        });
    });

    it('should filter customers', () => {
      return request(app)
        .get('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ email: dbCustomers.jhonDoe.email })
        .expect(httpStatus.OK)
        .then((res) => {
          delete dbCustomers.jhonDoe.password;
          const john = format(dbCustomers.jhonDoe);
          const includesjhonDoe = some(res.body, john);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesjhonDoe).to.be.true;
        });
    });

    it('should report error when pagination\'s parameters are not a number', () => {
      return request(app)
        .get('/v1/customers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: '?', perPage: 'whaat' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then((res) => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });

    it('should report error if logged customer is not an admin', () => {
      return request(app)
        .get('/v1/customers')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/customers/:customerId', () => {
    it('should get customer', async () => {
      const id = (await Customer.findOne({}))._id;
      delete dbCustomers.masterAccount.password;

      return request(app)
        .get(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbCustomers.masterAccount);
        });
    });

    it('should report error "Customer does not exist" when customer does not exists', () => {
      return request(app)
        .get('/v1/customers/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Customer does not exist');
        });
    });

    it('should report error "Customer does not exist" when id is not a valid ObjectID', () => {
      return request(app)
        .get('/v1/customers/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.equal('Customer does not exist');
        });
    });

    it('should report error when logged customer is not the same as the requested one', async () => {
      const id = (await Customer.findOne({ email: dbCustomers.masterAccount.email }))._id;

      return request(app)
        .get(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('PUT /v1/customers/:customerId', () => {
    it('should replace customer', async () => {
      delete dbCustomers.masterAccount.password;
      const id = (await Customer.findOne(dbCustomers.masterAccount))._id;

      return request(app)
        .put(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.OK)
        .then((res) => {
          delete customer.password;
          expect(res.body).to.include(customer);
          expect(res.body.role).to.be.equal('customer');
        });
    });

    it('should report error when email is not provided', async () => {
      const id = (await Customer.findOne({}))._id;
      delete customer.email;

      return request(app)
        .put(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" is required');
        });
    });

    it('should report error customer when password length is less than 6', async () => {
      const id = (await Customer.findOne({}))._id;
      customer.password = '12345';

      return request(app)
        .put(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(customer)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('password');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"password" length must be at least 6 characters long');
        });
    });

    it('should report error "Customer does not exist" when customer does not exists', () => {
      return request(app)
        .put('/v1/customers/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Customer does not exist');
        });
    });

    it('should report error when logged customer is not the same as the requested one', async () => {
      const id = (await Customer.findOne({ email: dbCustomers.masterAccount.email }))._id;

      return request(app)
        .put(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should not replace the role of the customer (not admin)', async () => {
      const id = (await Customer.findOne({ email: dbCustomers.jhonDoe.email }))._id;
      const role = 'admin';

      return request(app)
        .put(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(admin)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.role).to.not.be.equal(role);
        });
    });
  });

  describe('PATCH /v1/customers/:customerId', () => {
    it('should update customer', async () => {
      delete dbCustomers.masterAccount.password;
      const id = (await Customer.findOne(dbCustomers.masterAccount))._id;
      const { name } = customer;

      return request(app)
        .patch(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.be.equal(name);
          expect(res.body.email).to.be.equal(dbCustomers.masterAccount.email);
        });
    });

    it('should not update customer when no parameters were given', async () => {
      delete dbCustomers.masterAccount.password;
      const id = (await Customer.findOne(dbCustomers.masterAccount))._id;

      return request(app)
        .patch(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbCustomers.masterAccount);
        });
    });

    it('should report error "Customer does not exist" when customer does not exists', () => {
      return request(app)
        .patch('/v1/customers/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Customer does not exist');
        });
    });

    it('should report error when logged customer is not the same as the requested one', async () => {
      const id = (await Customer.findOne({ email: dbCustomers.masterAccount.email }))._id;

      return request(app)
        .patch(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should not update the role of the customer (not admin)', async () => {
      const id = (await Customer.findOne({ email: dbCustomers.jhonDoe.email }))._id;
      const role = 'admin';

      return request(app)
        .patch(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send({ role })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.role).to.not.be.equal(role);
        });
    });
  });

  describe('DELETE /v1/customers', () => {
    it('should delete customer', async () => {
      const id = (await Customer.findOne({}))._id;

      return request(app)
        .delete(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/customers'))
        .then(async () => {
          const customers = await Customer.find({});
          expect(customers).to.have.lengthOf(2);
        });
    });

    it('should report error "Customer does not exist" when customer does not exists', () => {
      return request(app)
        .delete('/v1/customers/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Customer does not exist');
        });
    });

    it('should report error when logged customer is not the same as the requested one', async () => {
      const id = (await Customer.findOne({ email: dbCustomers.masterAccount.email }))._id;

      return request(app)
        .delete(`/v1/customers/${id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/customers/profile', () => {
    it('should get the logged customer\'s info', () => {
      delete dbCustomers.jhonDoe.password;
      delete dbCustomers.jhonDoe.balance;

      return request(app)
        .get('/v1/customers/profile')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbCustomers.jhonDoe);
        });
    });

    it('should report error without stacktrace when accessToken is expired', async () => {
      // fake time
      const clock = sinon.useFakeTimers();
      const expiredAccessToken = (await Customer.findAndGenerateToken(dbCustomers.masterAccount)).accessToken;

      // move clock forward by minutes set in config + 1 minute
      clock.tick((JWT_EXPIRATION * 60000) + 60000);

      return request(app)
        .get('/v1/customers/profile')
        .set('Authorization', `Bearer ${expiredAccessToken}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.UNAUTHORIZED);
          expect(res.body.message).to.be.equal('jwt expired');
          expect(res.body).to.not.have.a.property('stack');
        });
    });
  });


  describe('GET /v1/ewallet/balance', () => {
    it('should get the logged customer\'s balance', () => {
      delete dbCustomers.jhonDoe.password;
      dbCustomers.jhonDoe.balance = 10000;

      return request(app)
        .get('/v1/ewallet/balance')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbCustomers.jhonDoe);
        });
    });
  });


  describe('POST /v1/ewallet/deposit', () => {
    it('should make a deposit to the the customer\'s account', () => {      
      const depositRequest = {
        amount: 10000,
        card: '4111111111111111',
      };
      
      return request(app)
        .post('/v1/ewallet/deposit')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(depositRequest)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).that.includes.all.keys([ 'customer', 'transaction'])
        });
    });


    it('should fail to make a deposit to the the customer\'s account', () => {    
      const depositRequest = {
        amount: 10000,
        card: '4242424242424242',
      };     

      return request(app)
        .post('/v1/ewallet/deposit')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(depositRequest)
        .expect(httpStatus.PAYMENT_REQUIRED)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.PAYMENT_REQUIRED);
        });
    });    
  });  

  describe('POST /v1/ewallet/transfer', () => {
    it('should make a transfer to another customer\'s account', () => {    
      const callRequest = {
        amount: 1000,
        destinationAccountNumber: 1001,
      };

      return request(app)
        .post('/v1/ewallet/transfer')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(callRequest)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).that.includes.all.keys([ 'customer', 'transaction'])
        });
    });
  });

  describe('POST /v1/ewallet/withdrawal', () => {
    it('should make a withdrawal from the customer\'s account to their debit card', () => {      
      const callRequest = {
        amount: 1000,
        card: '4111111111111111',
      };
      
      return request(app)
        .post('/v1/ewallet/withdrawal')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(callRequest)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).that.includes.all.keys([ 'customer', 'transaction'])
        });
    });
  });
  

  describe('GET /v1/ewallet/transactions', () => {
    it('should get all transactions from the customer\'s account', () => {
      return request(app)
        .get('/v1/ewallet/transactions')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(0);          
        });
    });
  });

});
