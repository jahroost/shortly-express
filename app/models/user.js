var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'user',
  hasTimestamps: true
});


User.register = function(userInfo) {
  // db.select('userInfo').whereNotExists(db('userInfo').where('userInfo'))
  // return db('users').insert(userInfo);
}

module.exports = User;
