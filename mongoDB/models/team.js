/**
 * Created by MengL on 2016/12/5.
 */
var mongoose = require('mongoose');
var TeamSchema = require('../schemas/Team.js');

var team = mongoose.model('team',TeamSchema);

module.exports = team;