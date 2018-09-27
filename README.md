# iot-blockchain

Based on this [article](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46) and [code](https://github.com/dvf/blockchain)

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

The config.json file is used for the server, but not committed to the repo, so you'll need to create one.
### sample config/config.json:
```json
{
  "development": {
    "PORT": 3000,
    "NODES": [
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5000"
		],
		"TRUSTED": [
			"0b53802081c3fbc6193bce1e8f71d39f8c5de0bd",
			"fb3caf5a08287591de2ec09b79b374ff3fa3d786"
		]
   },
   "test": {
    "PORT": 5002,
    "NODES": [
			{
				"protocol":	"http",
				"hostname":	"192.168.8.40",
				"port":			3000
			},
			{
				"protocol":	"http",
				"hostname":	"10.2.15.154",
				"port":			5000
			}
		],
   },
   "production": {
    "PORT": 5000
   }
}
```
