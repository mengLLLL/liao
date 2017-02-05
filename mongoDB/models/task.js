/**
 * Created by MengL on 2016/12/7.
 */
var mongoose = require('mongoose');
var TaskSchema = require('../schemas/Task.js');
var task = mongoose.model('task', TaskSchema);

module.exports = task;