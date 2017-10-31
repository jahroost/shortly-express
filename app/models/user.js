var db = require('../config');
var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs')
var bcryptPromise = Promise.promisify(bcrypt.hash);
var crypto = require('crypto');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      // console.log(model, attrs, options);
      return bcryptPromise(model.get('password'), null, null)
        .then(function (hash) {
          model.set('password', hash)
        })
    })
    // console.log('----------logthis>', logThis);
    // this.on('save', function(model, attrs, options) {
    //   console.log('STUFF',  model, attrs);
      // console.log('*****', this.get('password'))
      // var hash = bcrypt.hashSync(this.attributes.password, bcrypt.genSalt(10))
      // console.log("AHHHHHHHHHH", this.set)
    // });
  }
});


User.register = function(userInfo) {
  // console.log(userInfo);

  // console.log(knex.select('username').from('Users'))
}

module.exports = User;
