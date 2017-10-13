# E-Wallet Rest Api
E-Wallet Rest Api Example. Using Node.js, Express and MongoDB.

## Requirements

 - [Node v7.6+](https://nodejs.org/en/download/current/) or [Docker](https://www.docker.com/)
 - [Yarn](https://yarnpkg.com/en/docs/install)

## Getting Started

Clone the repo:

```bash
git clone https://github.com/mmucito/ewallet-rest-api.git
cd ewallet-rest-api
```
Install yarn:

```bash
npm install -g yarn
```

Install dependencies:

```bash
yarn
```

Set environment variables:

```bash
cp .env.example .env
```

## Running Locally

```bash
yarn dev
```

## Running in Production

```bash
yarn start
```

## API Reference
https://ewallet-rest-api.herokuapp.com/v1/docs/

## API Endpoint
https://ewallet-rest-api.herokuapp.com/

## API Postman Collection for Testing
https://github.com/mmucito/ewallet-rest-api/blob/master/ewallet.postman_collection.json

## Testing Locally...

### First you need to Create a Customer
```bash
curl -X POST \
  http://localhost:3000/v1/auth/register \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: 030c9874-23c0-367b-7e2b-aea506e851c4' \
  -d 'email=jhon_doe%40gmail.com&password=123456&name=Jhon%20Doe'
```

### Login
```bash
curl -X POST \
  http://localhost:3000/v1/auth/login \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: b309972f-4942-d788-30a0-df86f4f1b854' \
  -d 'email=jhon_doe%40gmail.com&password=123456'
```

### Get eWallet Balance
```bash
curl -X GET \
  http://localhost:3000/v1/ewallet/balance \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDc3NDM4MTgsImlhdCI6MTUwNzc0MjkxOCwic3ViIjoiNTlkZTUzZDVhYzM5ZmQ1ODQ3MGRjODI4In0.mUry4SFaWRqRrBmNF1RBBnJMvcvJBYAktqczpMj8r2w' \
  -H 'cache-control: no-cache' \
  -H 'postman-token: 6df0eb80-e0fc-5f47-4b72-2f3f165eeaaf'
```

### Make a Deposit to your eWallet
```bash
curl -X POST \
  http://localhost:3000/v1/ewallet/deposit \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDc3NDM4MTgsImlhdCI6MTUwNzc0MjkxOCwic3ViIjoiNTlkZTUzZDVhYzM5ZmQ1ODQ3MGRjODI4In0.mUry4SFaWRqRrBmNF1RBBnJMvcvJBYAktqczpMj8r2w' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: 66218aae-19ee-3761-e0c0-53823d0d4820' \
  -d 'amount=10&card=4111111111111111'
```
Note: You can simulate a Payment Rejected by the PaymentGateway using this card `4242424242424242`

### Get eWallet Transactions
```bash
curl -X GET \
  http://localhost:3000/v1/ewallet/transactions \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDc3NDM4MTgsImlhdCI6MTUwNzc0MjkxOCwic3ViIjoiNTlkZTUzZDVhYzM5ZmQ1ODQ3MGRjODI4In0.mUry4SFaWRqRrBmNF1RBBnJMvcvJBYAktqczpMj8r2w' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: ff68cdff-9fac-9647-4594-70315ab1f4cd'
```

### Make a Transfer to another eWallet
```bash
curl -X POST \
  http://localhost:3000/v1/ewallet/transfer \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDc3NjYyOTgsImlhdCI6MTUwNzc2NTM5OCwic3ViIjoiNTlkZWE4ZDA2YzkyYmQ2ZTdkZjZiMzMwIn0.PGSdiEpPG43ihnJldKFY-MMqNzaGb4PwOylUbA05AVY' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: 78116228-4061-257a-f47c-37033d474596' \
  -d 'amount=100&destinationAccountNumber=1001'
```
Note: Every Transaction will generate a fee that will be discounted from the eWallet Balance and will be credited to the [Master Account](#masteraccount) according to this table.

Amount | Percent | Fixed rate
|---|---|---|---|---|
x <= 1,000 | 3.0% | $8.00
1,000 > x <= 5,000 | 2.5% | $6.00
5,000 > x <= 10,000. | 2.0% | $4.00
10,000 > x | 1.0% | $3.00


### Triggers a Withdrawal from your eWallet
```bash
curl -X POST \
  http://localhost:3000/v1/ewallet/withdrawal \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDc3NzI5NjAsImlhdCI6MTUwNzc3MjA2MCwic3ViIjoiNTlkZWE4ZDA2YzkyYmQ2ZTdkZjZiMzMwIn0.SF8OdwKfT-fiWbkhUgnTKWfyeZCY_p3ek4j2dPVukuc' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: d2292d62-cefd-e7b9-311a-12fe92795c79' \
  -d 'amount=1500&card=4111111111111111'
```
Note: You can simulate a Failure on the Withdrawal Gateway using this card `4242424242424242`

## <a name="masteraccount"></a>Master Account Info
### Login
```bash
curl -X POST \
  http://localhost:3000/v1/auth/login \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'postman-token: 4e2b3f90-343e-7643-89a3-957dc0ba36c7' \
  -d 'email=master_account%40bank.com&password=master'
```

### Get Master Account Balance
```bash
curl -X GET \
  http://localhost:3000/v1/ewallet/balance \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDc3NDM4MTgsImlhdCI6MTUwNzc0MjkxOCwic3ViIjoiNTlkZTUzZDVhYzM5ZmQ1ODQ3MGRjODI4In0.mUry4SFaWRqRrBmNF1RBBnJMvcvJBYAktqczpMj8r2w' \
  -H 'cache-control: no-cache' \
  -H 'postman-token: 6df0eb80-e0fc-5f47-4b72-2f3f165eeaaf'
```

## Lint

```bash
# lint code with ESLint
yarn lint

# try to fix ESLint errors
yarn lint:fix
```

## Test

```bash
# run all tests with Mocha
yarn test
```

## Validate

```bash
# run lint and tests
yarn validate
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Documentation

```bash
# generate and open api documentation
yarn docs
```

## Docker

```bash
# run container locally
yarn docker:dev
or
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# run container in production
yarn docker:prod
or
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# run tests
yarn docker:test
or
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
```

## Deploy

Set your server ip:

```bash
DEPLOY_SERVER=127.0.0.1
```

Replace my Docker username with yours:

```bash
nano deploy.sh
```

Run deploy script:

```bash
yarn deploy
or
sh ./deploy.sh
```


## License

This project is licensed under the [MIT License](https://github.com/mmucito/ewallet-rest-api/blob/master/LICENSE)


Using [express-rest-es2017-boilerplate](https://github.com/danielfsousa/express-rest-es2017-boilerplate) as a Starter Seed.