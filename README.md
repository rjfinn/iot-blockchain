# iot-blockchain

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
