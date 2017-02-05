/**
 * Created by MengL on 2016/12/7.
 */
var mongoose = require('mongoose');
var TaskSchema = new mongoose.Schema({
  title: String,
  owner: {
    id: Number,
    name: String,
    avatar: String
  },
  brief: String,
  endAt: Date,
  taskId: Number,
  teamId: Number,
  members:[{
    userId:Number,
    name: String
  }],
  topicId: Number,
  taskArr: [{
    taskItemId: Number,
    creater:{
      userId: Number,
      name: String
    },
    users:[{
      id: Number,
      name: String
    }],
    endAt:{
      type: Date
    },
    condition:{
      type:Number,
      default: 0
    },
    brief: String
  }],
  topicArr:[{
    topicId:Number
  }],
  createAt:{
    type:Date,
    default: Date.now()
  },
  condition: {
    type: Number,
    default: 0
  },
  statistics:{
    sum: {
      type:Number,
      default:0
    },
    working: {
      type:Number,
      default:0
    },
    finished: {
      type:Number,
      default:0
    },
    overdue: {
      type:Number,
      default:0
    },
    percent:{
      type: Number,
      default: 0
    }
  },
  files:[{
    file_type: Number,
    fileName: String,
    source: String,
    uploader:{
      id: Number,
      name: String
    },
    collectors:[{
      userId: Number
    }]
  }],
  newConditionNotice:[{
    userId: Number
  }],
  newTaskNotice:[{
    userId: Number
  }]

});

module.exports = TaskSchema;

//collectors 是收藏这个文件的用户的id数组