/**
 * Created by MengL on 2016/12/16.
 */
var mongoose = require('mongoose');
var ChatRecordSchema = require('../schemas/ChatRecord.js');
var chatRecord = mongoose.model('chatRecord', ChatRecordSchema);

module.exports = chatRecord;