/**
 * Created by MengL on 2016/12/7.
 */
var mongoose = require('mongoose');
var TopicSchema = new mongoose.Schema({
  title: String,
  owner:{
    id: Number,
    name: String,
    avatar: String
  },
  brief: String,
  topicId: Number,
  teamId: Number,
  members:[{
    userId:{
      type: Number
    },
    name:{
      type:String
    }
  }],
  createAt:{
    type:Date,
    default:  Date.now()
  },
  endAt: {
    type: Date
  },
  taskArr:[{
    taskId: Number
  }],
  taskId: Number,
  condition:{
    type: Number,
    default: 0
  },
  chatRecordId: Number,
  summarys:[{
    chatType: Number,
    fileName:{
      type:String,
      default:""
    },
    chatItemId:Number,
    chatRecordId: Number,
    chatContent: String,
    user:{
      id: Number,
      name: String,
      avatar: String
    },
    createAt: String
  }],
  files:[{
    file_type: Number,
    fileName:String,
    source: String,
    uploader:{
      id: Number,
      name: String
    },
    collectors:[{
      userId: Number
    }]
  }],
  atwho:[{
    userId: Number,
    userName: String,
    from:[{
      userId: Number,
      userName: String,
      createAt:{
        type: Date,
        default:Date.now()
      },
      chatItemId: Number
    }]
  }],
  noticeWho:[{
   userId: Number
  }]
});
module.exports = TopicSchema;