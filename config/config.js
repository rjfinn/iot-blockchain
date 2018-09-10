var env = process.env.NODE_ENV || 'development';
//console.log('env *****', env);

if (env === 'development' || env === 'test') {
  var config = require('./config.json')[env];
  Object.keys(config).forEach((key) => {
    process.env[key] = config[key];
  });
}
