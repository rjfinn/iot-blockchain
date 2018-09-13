# iot-blockchain

Based on this [article](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46) and[code](https://github.com/dvf/blockchain)

### setup
```shell
$ cd iot-blockchain
$ npm install
$ npm install --only=dev
```

### run tests
```shell
mocha tests/blockchain.tests.js
```

The config.json file is used for the server, which isn't currently done.
### sample config/config.json:
```json
{
  "development": {
    "PORT": 3001
   },
   "test": {
    "PORT": 3002
   },
   "production": {
    "PORT": 3000
   }
}
```
