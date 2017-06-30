/**
 * Created by MengL on 2016/12/1.
 */
var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  name:String,
  password:String,
  userId:Number,
  avatar:{
    default:"",
    type:String
  },
  nickName:String,
  realName: {
    tag: false,
    name: {
      default:"",
      type: String
    }
  },
  department:{
    type: String,
    default: ""
  } ,
  jobName: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: Number,
    default: ""
  },
  email:{
    type: String,
    default: ""
  },
  wechat: {
    type: String,
    default: ""
  },
  teams:[{
    teamId: Number,
    tag:{
      type: Boolean,
      default: true
    }
  }],
  topics:[{
    topicId: Number
  }],
  tasks:[{
    taskId: Number
  }],
  taskArr:[{
    taskId: Number,
    taskItems: [{
      taskItemId: Number,
      condition:{
        type:Number,
        default:0
      }
    }]
  }],
  notification:[{
    msg_type: Number,
    from: {
      id: Number,
      name: String
    },
    createAt:{
      type:Date,
      default: Date.now()
    },
    read_tag:{
      type: Boolean,
      default: false
    },
    deal_tag: {
      type: Boolean,
      default: false
    },
    content:String,
    reply_content: String,
    team:{
      id: Number,
      name: String
    },
    id: Number,
    topic: {
      id: Number,
      title: String
    },
    chatRecord:{
      chatItemId: Number,
      chatRecordId: Number
    },
    task:{
      users: [{
        id: Number,
        name: String
      }],
      taskId: Number,
      taskItemId: Number
    }
  }],
  applyTeams:[{
    type:Number
  }],
  collections:[{
    topicId: Number,
    chatItemId: Number,
    chatType: Number,
    fileName:{
      type:String,
      default:""
    },
    chatRecordId: Number,
    chatContent: String,
    user:{
      id: Number,
      name: String,
      avatar: String
    },
    createAt: String
  }],
  TopicFileCollections:[{
    topicId:Number,
    file_id: String
  }],
  TaskFileCollections:[{
    taskId:Number,
    file_id: String
  }],
  personStatistics:{
    chatSum: Number,
    task:{
      taskHostSum: Number,
      taskSum: Number
    }
  }
});

module.exports = UserSchema;


