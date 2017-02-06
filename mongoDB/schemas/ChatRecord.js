/**
 * Created by MengL on 2016/12/16.
 */
var mongoose = require('mongoose');
var ChatRecordSchema = new mongoose.Schema({
  chatRecordId: Number,
  topicId: Number,
  chatItem:[{
    chat_type: Number,
    fileName:{
      type: String,
      default:""
    },
    chatItemId: Number,
    atwho:{
      userId: Number,
      userName: String
    },
    user:{
      id: Number,
      name: String,
      avatar:{
        default:'http://donew.oss-cn-hangzhou.aliyuncs.com/liao/topic/1/2017-01-03/IMG_5426.JPG',
        type:String
      }
    },
    reply:[{
      replyId: Number,
      user:{
        id: Number,
        name: String,
        avatar: String
      },
      createAt:{
        type:Date,
        default:Date.now()
      }
    }],
    agree:[{
      agreeId: Number,
      user:{
        id: Number,
        name: String,
        avatar: String
      },
      createAt:{
        type:Date,
        default:Date.now()
      }
    }],
    collect:[{
      collectId: Number,
      user:{
        id: Number,
        name: String,
        avatar: String
      },
      createAt:{
        type:Date,
        default:Date.now()
      }
    }],
    createAt:{
      type:Date,
      default:Date.now()
    },
    chatContent: String
  }],
  createAt:{
    type:Date,
    default:Date.now()
  },

});

ChatRecordSchema.statics.getChat = function (chatRecordId, cb) {
  this.find({chatRecordId: chatRecordId},cb)
};
module.exports = ChatRecordSchema;