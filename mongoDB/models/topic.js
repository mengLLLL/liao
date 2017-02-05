/**
 * Created by MengL on 2016/12/7.
 */
var mongoose = require('mongoose');
var TopicSchema = require('../schemas/Topic.js');

var topic = mongoose.model('topic', TopicSchema);
module.exports = topic;