/**
 * Created by MengL on 2016/12/1.
 */
var mongoose = require('mongoose');
var UserSchema = require('../schemas/User.js');
var user = mongoose.model('user',UserSchema);
module.exports = user;