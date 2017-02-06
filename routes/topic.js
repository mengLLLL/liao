/**
 * Created by MengL on 2016/12/10.
 */
var express = require('express');
var router = express.Router();
var user = require('../mongoDB/models/user.js');
var team = require('../mongoDB/models/team.js');
var topic = require('../mongoDB/models/topic.js');
var task = require('../mongoDB/models/task.js');
var chat = require('../mongoDB/models/chatRecord.js')
var async = require('async');
var _ = require("lodash");
var moment = require('moment');
//创建一个话题：
//1.存储话题本身
//2.更新用户信息中的话题部分
//3.更新team中的topic数组

router.post("/create/topic", function (req, res) {
  if(req.xhr || req.accepts('json, html') === 'json'){
    //console.log('req.data', req.body)
    async.auto({
      getChatId: function (callback) {
        chat.count(function (err, count) {
          if(err){
            callback(null)
            return console.error(err)
          }
          callback(null, count+1)
        })
      },
      getTopicId: function (callback) {
        topic.count(function (err, count) {
          if(err){
            callback(null)
            return console.error(err)
          }
          callback(null, count)
        })
      },
      createChatRecordCollection: ['getChatId','getTopicId', function (results, callback) {
        var chatObj = new chat({
            chatRecordId: results.getChatId,
            chatItem: [],
            topicId:results.getTopicId
        });
        chatObj.save(function (err, result) {
          //console.log('chat record', result);
          if(err){
            console.error(err)
          }
          callback(null)
        })
      }],
      createTopic:['getChatId', 'getTopicId', function (results, callback) {
        //console.log(req.body.hasTask)
        if(req.body.hasTask == 'false'){
          var newTopic = new topic({
            title: req.body.topicName,
            owner:{
              id:req.session.user.userId,
              name: req.session.user.nickName,
              avatar: req.session.user.avatar
            },
            brief: req.body.topicContent,
            endAt: req.body.endTime,
            topicId: results.getTopicId,
            teamId: req.session.team.teamId,
            chatRecordId: results.getChatId
          });
          newTopic.members.push({
            userId:req.session.user.userId,
            name: req.session.user.nickName
          });
          newTopic.save(function (err, saveResult) {
            //console.log('save topic',saveResult)
            if(err){
               console.error(err)
            }
            user.update({userId: req.session.user.userId}, {$push:{"topics": {"topicId" :saveResult.topicId}}}, function(err){})
            team.update({teamId: req.session.team.teamId}, {$push:{"topics": saveResult.topicId}}, function(err){})
            callback(null, saveResult);
          })
        }else{
          var newTopic = new topic({
            title: req.body.topicName,
            owner:{
              id:req.session.user.userId,
              name: req.session.user.nickName,
              avatar: req.session.user.avatar
            },
            brief: req.body.topicContent,
            endAt: req.body.endTime,
            topicId: results.getTopicId,
            teamId: req.session.team.teamId,
            chatRecordId: results.getChatId,
            taskId: req.body.taskId
          });
          newTopic.members.push({
            userId:req.session.user.userId,
            name: req.session.user.nickName
          });
          newTopic.save(function (err, result) {
            //console.log('save topic', result)
            if(err){
              return console.error(err)
            }
            task.find({taskId: req.body.taskId}, function (err, taskResults) {
              if(err){
                return console.error(err)
              }
              taskResults[0].topicArr.push({
                topicId: result.topicId
              });
              taskResults[0].markModified('topicArr');
              taskResults[0].save(function (err, saveResults) {
                if(err){
                  return console.error(err)
                }
              })
            });
            user.update({userId: req.session.user.userId}, {$push:{"topics": {"topicId" :result.topicId}}}, function(err){})
            team.update({teamId: req.session.team.teamId}, {$push:{"topics": result.topicId}}, function(err){})
            callback(null, result);
          })
        }

      }]
    }, function (err, finalResults) {
      if(err){
        res.send({
          success: false
        })
        return console.error(err)
      }
      //console.log('finalResults', finalResults)
      res.send({
        success: true,
        result: finalResults.createTopic
      })
    });

  }
});


//搜索话题
router.post("/search/topic", function (req, res) {
  var name = req.body.name;
  topic.find({title: name}, function(err ,topics){
    if(err){
      res.send({
        success:false
      });
      return console.error(err);
    }
    if(topics.length == 0 ){
      return res.send({
        success:false
      })
    }
    res.send({
      success:true,
      topics: topics
    })
  })
});


//某一个话题的页面
//还要得到摘要（话题主的和我的）
//将topic的atwho数组置空
router.get('/topic', function (req, res) {
  var topicId = req.query.topicId;
  async.auto({
    getTopic: function (callback) {
      topic.find({topicId: topicId}, function (err, results) {
        //console.log('getTopic', results)
        if(err){
          return console.error(err)
        }
        callback(null,results[0])
      })
    },
    atTopic: ['getTopic', function (results, callback) {
      //检查是不是有at
      var topicObj = results.getTopic;
      if(topicObj.atwho.length > 0){
        //atwho有内容
        //console.log('atwho topic', topicObj.atwho)
        for(var i = 0; i< topicObj.atwho.length; i++){
          if(req.session.user.userId == topicObj.atwho[i].userId){
            //找到了有关自己的@
            async.map(topicObj.atwho[i].from, function (item, cb){
              cb(null, item)
            }, function(err, mapResults){
              //console.log('map result', mapResults)
              if(err){
                return console.error(err)
              }else{
                topicObj.atUser = mapResults
              }
            });
            break;
          }
        }
        callback(null, topicObj)
      }else{
        callback(null, topicObj)
      }
    }],
    clearAtWho: ['getTopic', function (results, callback) {
      //清空atwho数组 清空的是当前用户的那一项，并不是全部删除
      var topicObj = results.getTopic;
      if(topicObj.atwho.length > 0){
        for(var i = 0; i< topicObj.atwho.length; i++){
          if(req.session.user.userId == topicObj.atwho[i].userId){
            break;
          }
        }
        if(i == topicObj.atwho.length){
          //说明没有找到
          callback(null)
        }else{
          topicObj.atwho.splice(i,1);
          topicObj.markModified('atwho');
          topicObj.save(function (err, saveResult) {
            if(err){
              callback(null,'save err')
              return console.error(err)
            }else{
              callback(null)
            }
          })
        }
      }else{
        callback(null)
      }
    }],
    checkHost: ['getTopic', function (results, callback) {
      //判断是不是话题主
      if(results.getTopic.owner.id == req.session.user.userId){
        callback(null,'true')
      }else{
        callback(null,'false')
      }
    }],
    getChatRecord: ['getTopic', function (results, callback) {
      chat.find({chatRecordId: results.getTopic.chatRecordId}).where('chatItem').slice(-10).exec(function (err, findResults) {
        //console.log('lalalalalala', findResults[0].chatItem);
        callback(null, findResults[0].chatItem)
      })
    }],
    getSummarys: function (callback) {
      topic.find({topicId: topicId}, function (err, topicResults) {
        if(err){
          callback(null,'err');
          return console.error(err)
        }

        callback(null, topicResults[0].summarys)
      })
    },
    getCollections: function(callback){
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,'err');
          return console.error(err)
        }
        var topic_collections=[];
        userResults[0].collections.forEach(function (obj, i, arr) {
          if(obj.topicId == topicId){
            topic_collections.push(obj)
          }
        })
        callback(null,topic_collections)
      })
    },
    getSubTask: ['getTopic', function (results, callback) {
      if(results.getTopic.taskArr.length > 0){
        var taskArr = [];
        async.map(results.getTopic.taskArr,function (item, cb) {
          task.find({taskId: item.taskId}, function (err, taskResults) {
            if(err){
              cb(null,'err');
              return console.error(err)
            }
            cb(null, taskResults[0])
          })
        }, function (err, mapResults) {
          if(err){
            callback(null,'err')
            return console.error(err)
          }
          callback(null, mapResults)
        })
      }else{
        callback(null)
      }

    }]
  }, function (err, finalResults) {
    res.render('topic',{
      topic: finalResults.getTopic,
      chats: finalResults.getChatRecord,
      summarys: finalResults.getSummarys,
      collections: finalResults.getCollections,
      host: finalResults.checkHost,
      subTask: finalResults.getSubTask
    })
  })

});


/**
 * m_code的含义：
 * 0---》聊天中没有at
 * 1---》聊天中有at并且给用户发送了通知
 * 2---》聊天中有at但是发送通知失败
 * 3---》聊天中有at但是没有找到该用户
 */
router.post('/chat', function (req, res) {
  var userId = req.session.user.userId;
  var userName = req.session.user.nickName;
  var chatContent = req.body.chatContent;
  var avatar =  req.session.user.avatar;
  var topicId = req.body.topicId;
  var atWho;
  if(req.body.at){
    atWho = req.body.at[1];
  }else{
    atWho = null
  }
  //console.log('at',atWho)
  //console.log('chat chat_type', req.body.chat_type)
  async.auto({
    saveFile: function (callback) {
      if(req.body.fileObj){
        topic.find({topicId: topicId}, function (err, topicResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err'
            })
          }else{
            topicResults[0].files.push({
              file_type: req.body.fileObj.file_type,
              fileName: req.body.fileObj.fileName,
              source: req.body.fileObj.source,
              uploader:{
                id: req.session.user.userId,
                name: req.session.user.nickName
              }
            });
            topicResults[0].markModified('files');
            topicResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: 'save err'
                })
              }else{
                callback(null,{
                  success: true,
                  file_id: saveResult.files[saveResult.files.length-1]._id,
                  uploader:{
                    id: req.session.user.userId,
                    name: req.session.user.nickName
                  }
                })
              }
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: 'no file to save'
        })
      }
    },
    getTopic: function(callback){
      topic.find({topicId: topicId}, function(err, topicResults){
        if(err) {
          callback(null, 'find topic err');
          return console.error(err)
        }else{
          callback(null, topicResults[0])
        }
      })
    },
    getAtWhoAndNoti:['getTopic', function (results,callback) {
      if(atWho){
       //就是聊天信息中有@
        user.find({nickName: atWho}, function (err, userResults) {
          if(userResults.length == 1){
           userResults[0].notification.push({
             topic: {
               id: topicId,
               title: results.getTopic.title
             },
             msg_type: 4,
             from:{
               id: req.session.user.userId,
               name: req.session.user.nickName
             },
             id: userResults[0].notification.length+1
           });
            userResults[0].markModified('notification');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null, {
                  m_code:2
                });
                return console.error(err)
              }else{
                callback(null,{
                  m_code:1,
                  user: {
                    userId: saveResult.userId,
                    userName: saveResult.nickName
                  }
                });
              }
            })
          }else{
            callback(null,{
              m_code:3
            })
          }
        })
      }else{
        callback(null,{
          m_code:0
        })
      }
    }],
    updateTopic: ['getTopic','getAtWhoAndNoti','saveChat', function(results, callback){
      var current_topic = results.getTopic;
      //console.log('current_topic',current_topic)
      if(results.getAtWhoAndNoti.m_code == 1){
        //被at的用户数据库保存成功
        if(current_topic.atwho.length > 0){
          //当前atwho列表不为空，那么去检查被at的人是不是在这个数组当中
          for(var j = 0; j< current_topic.atwho.length; j++){
            if(results.getAtWhoAndNoti.user.userId == current_topic.atwho[j].userId){
              //列表中有此人
              current_topic.atwho[j].from.push({
                userId: req.session.user.userId,
                userName: req.session.user.nickName,
                chatItemId: results.saveChat.chatItemId
              });
              break;
            }
          }
          if(j == current_topic.atwho.length){
            console.log('results.saveChat.chatItemId',results.saveChat.chatItemId)
            //说明数组遍历完，没有找到被at的用户
            current_topic.atwho.push({
              userId: results.getAtWhoAndNoti.user.userId,
              userName: results.getAtWhoAndNoti.user.userName,
              from:[{
                userId: req.session.user.userId,
                userName: req.session.user.nickName,
                chatItemId: results.saveChat.chatItemId
              }]
            })
          }
          current_topic.markModified('atwho');
          current_topic.save(function (err, saveResults) {
            if(err){
              callback(null,'save err')
              return console.error(err)
            }else{
              //console.log('sssssss',saveResults)
              callback(null, saveResults)
            }
          })
        }else{
          //当前atwho列表是空的
          //console.log('kongkongkongkong results.saveChat.chatItemId',results.saveChat.chatItemId)
          current_topic.atwho.push({
            userId: results.getAtWhoAndNoti.user.userId,
            userName: results.getAtWhoAndNoti.user.userName,
            from:[{
              userId: req.session.user.userId,
              userName: req.session.user.nickName,
              chatItemId: results.saveChat.chatItemId
            }]
          });
          current_topic.markModified('atwho');
          current_topic.save(function (err, saveResult) {
            if(err){
              callback(null,'save err')
              return console.error(err)
            }else{
              //console.log('save yihou ', saveResult)
              callback(null, saveResult)
            }
          })
        }
      }else{
        callback(null)
      }
    }],
    getChatCollection: function(callback){
      topic.find({topicId: topicId}, function (err, topicResults) {
        //console.log('topicResults', topicResults[0])
        if(err){return console.error(err)}
        //console.log('chatRecordId', topicResults[0].chatRecordId )
        callback(null, topicResults[0].chatRecordId)
      })
    },
    saveChat: [ 'getChatCollection', function (results, callback) {
      chat.find({chatRecordId: results.getChatCollection}, function (err, chatCollResults) {
        if(err){return console.error(err)}
        var publicChat = {
          chatItemId: chatCollResults[0].chatItem.length + 1,

          user:{
            id: userId,
            name: userName,
            avatar: req.session.user.avatar
          },
          chatContent: chatContent,
          chat_type: req.body.chat_type,
          createAt: moment()
        };
        if(atWho){
          console.log('atwho')
          user.find({nickName: atWho}, function (err, userResults) {
            if(err){
              return console.error(err)
            }else{
              if(userResults.length == 1){
                chatCollResults[0].chatItem.push({
                  chatItemId: chatCollResults[0].chatItem.length + 1,
                  atwho:{
                    userId: userResults[0].userId,
                    userName: userResults[0].nickName
                  },
                  user:{
                    id: userId,
                    name: userName,
                    avatar: req.session.user.avatar
                  },
                  chatContent: chatContent,
                  chat_type: req.body.chat_type
                });
                chatCollResults[0].markModified('chatItem');
                chatCollResults[0].save(function (err, saveResult) {
                  if(err){
                    callback(null,'false')
                    return console.error(err)
                  }
                  callback(null, publicChat)
                })
              }else{
                //TODO 这里错误处理再精细一点（返回给前端的错误提示）
                return console.error(err)
              }
            }
          })
        }else{
          console.log('not atwho')
          if(req.body.fileObj){
            chatCollResults[0].chatItem.push({
              chatItemId: chatCollResults[0].chatItem.length + 1,
              fileName: req.body.fileObj.fileName,
              user:{
                id: userId,
                name: userName,
                avatar: req.session.user.avatar
              },
              chatContent: chatContent,
              chat_type: req.body.chat_type
            });
          }else{
            chatCollResults[0].chatItem.push({
              chatItemId: chatCollResults[0].chatItem.length + 1,
              user:{
                id: userId,
                name: userName,
                avatar: req.session.user.avatar
              },
              chatContent: chatContent,
              chat_type: req.body.chat_type
            });
          }
          chatCollResults[0].markModified('chatItem');
          chatCollResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,'false')
              return console.error(err)
            }
            callback(null, publicChat)
          })
        }

      })
    }]
  }, function (err, finalResult) {
    if(err){return console.error(err)}
    console.log('chat finalResults', finalResult.saveFile);
    if(finalResult.getAtWhoAndNoti.m_code == 1){
      res.send({
        success:true,
        user:{
          userId: req.session.user.userId,
          userName: req.session.user.nickName,
          avatar: req.session.user.avatar
        },
        publicChat: finalResult.saveChat,
        at:true,
        toUser:finalResult.getAtWhoAndNoti.user,
        chatRecordId: finalResult.getChatCollection

      })
    }else{
      if(finalResult.saveFile){
        res.send({
          success:true,
          user:{
            userId: req.session.user.userId,
            userName: req.session.user.nickName,
            avatar: req.session.user.avatar
          },
          publicChat: finalResult.saveChat,
          chatRecordId: finalResult.getChatCollection,
          file_id: finalResult.saveFile.file_id
        })
      }else{
        res.send({
          success:true,
          user:{
            userId: req.session.user.userId,
            userName: req.session.user.nickName,
            avatar: req.session.user.avatar
          },
          publicChat: finalResult.saveChat,
          chatRecordId: finalResult.getChatCollection,
        })
      }

    }

  })

});

// 对某个评论点赞
router.post("/chat/agree", function (req, res) {
  //console.log(req.body)
  async.auto({
    getUserName: function (callback) {
      callback(null, req.session.user.nickName)
    },
    saveAgree: ['getUserName',function (results,callback) {
      chat.find({chatRecordId: req.body.chatRecordId}, function (err, chatResults) {
        if(err){
          callback(null,'err')
          return console.error(err)}
        var chats = chatResults[0].chatItem;
        var j;
        for(j=0;j<chats.length;j++){
          if(chats[j].chatItemId == req.body.chatItemId){
            var chatOwner = chats[j].user;
            var chatContent = chats[j].chatContent;
            chats[j].agree.push({
              user:{
                id: req.body.userId,
                name: results.getUserName,
                avatar: req.session.user.avatar
              },
              agreeId:chats[j].agree.length+1
            });
            break;
          }
        }
        chatResults[0].markModified('chatItem');
        chatResults[0].save(function (err, results) {
          //console.log('save success', results)
        });
        callback(null,{chatOwner:chatOwner,chatContent:chatContent})
      })
    }],
    sendNotification: ['getUserName', 'saveAgree',function (results, callback) {
      user.find({userId: results.saveAgree.chatOwner.id}, function (err,userResults) {
        if(err){
          callback(null,'err')
          return console.error(err)
        }
        userResults[0].notification.push({
          msg_type: 6,
          from: results.saveAgree.chatOwner,
          chatRecord:{
            chatRecordId: req.body.chatRecordId,
            chatItemId: req.body.chatItemId
          },
          content:results.saveAgree.chatContent
        })
        userResults[0].markModified('notification');
        userResults[0].save(function (err, results) {
          if(err){
            callback(null,'err')
            return console.error(err)
          }
          callback(null,'true')
        })
      })
    }]
  }, function (err, finalResults) {
    //console.log('agree',finalResults)
    if(finalResults.sendNotification == 'true'){
      res.send({
        success:true,
        from: req.session.user.userId,
        to: finalResults.saveAgree.chatOwner.id
      })
    }else{
      res.send({
        success:false
      })
    }

  })
});

//取消点赞,仅仅把chatItem中的数据删掉就可以了
router.post('/chat/disagree', function(req, res){
  async.auto({
    updateChatItem: function (callback) {
      chat.find({chatRecordId: req.body.chatRecordId}, function (err, chatResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg:'find err'
          });
          return console.error(err)
        }else{
          var chats = chatResults[0].chatItem;
          for(var i = 0; i < chats.length; i++){
            if(chats[i].chatItemId == req.body.chatItemId){
              break;
            }
          }
          if(i < chats.length){
            //找到了
            for(var j = 0; i< chats[i].agree.length; j++){
              if(chats[i].agree[j].user.id == req.body.userId){
                break;
              }
            }
            if(j < chats[i].agree.length){
              chats[i].agree.splice(j,1);
              chatResults[0].markModified('chatItem');
              chatResults[0].save(function (err, saveResult) {
                if(err){
                  callback(null,{
                    success: false,
                    errMsg:'save err'
                  });
                  return console.error(err)
                }else{
                  callback(null,{
                    success: true
                  })
                }
              })
            }else{
              callback(null,{
                success: false,
                errMsg:'not found in chatItem agree array'
              })
            }
          }else{
            callback(null,{
              success: false,
              errMsg:'not found in chatItem aggar'
            })
          }
        }
      })
    }
  }, function(err, finalResults){
    console.log('finaResults', finalResults)
    if(err){
      res.send({
        success: false,
        msg:'async err'
      })
    }else{
      if(finalResults.updateChatItem.success){
        res.send({
          success: true
        })
      }else{
        res.send({
          success: false,
          msg: finalResults.updateChatItem.errMsg
        })
      }
    }

  })
});
//收藏文件
router.post("/chat/collect/file", function (req, res) {
  async.auto({
    saveFileToUser: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }else{
          //如果直接存了文件的信息，文件如果删除了，这边的信息就不对了，所以这样通过找的方式来获得收藏的文件
          userResults[0].fileCollections.push({
            topicId: req.body.topicId,
            file_id: req.body.file_id
          })
          userResults[0].markModified('fileCollections');
          userResults[0].save(function (err, saveResult) {
            if(err){
              callback(null, {
                success:false,
                errMsg:'save err'
              });
              return console.error(err)
            }else{
              callback(null,{
                success: true
              })
            }
          })
        }
      })
    }
  }, function (err, finalResults) {
    if(err){
      res.send({
        success:false
      })
    }else{
      res.send({
        success: true
      })
    }
  })
});

router.post("/chat/delete/file", function (req, res) {
  async.auto({
    deleteFile: function(callback){
      topic.find({topicId: req.body.topicId}, function (err, topicResults) {
        //console.log('find topicREsults', topicResults)
        if(err){
          callback(null,{
            success: false,
            errMsg:'find err'
          })
          return console.error(err)
        }else{
          for(var i = 0; i< topicResults[0].files.length; i++){
            if(req.body.file_id == topicResults[0].files[i]._id){
              console.log('找到啦')
              break;
            }
          }
          if(i < topicResults[0].files.length){
            //if(i == 0){
            //  topicResults[0].files.splice(i,1);
            //}else{
            //  topicResults[0].files.splice(i,i);
            //}
            topicResults[0].files.splice(i,1);
            topicResults[0].markModified('files');
            topicResults[0].save(function(err, saveResult){
              if(err){
                callback(null,{
                  success: false,
                  errMsg:'save err'
                });
                return console.error(err)
              }else{
                callback(null,{
                  success:true
                })
              }
            });
          }else{
            callback(null,{
              success:false,
              errMsg:'not found file in topic'
            })
          }
        }
      })
    }
  }, function (err, finalResults) {
    if(err){
      console.log('err',err)
      res.send({
        success:false
      })
    }else{
      if(finalResults.deleteFile.success == true){
        res.send({
          success:true
        })
      }else{
        res.send({
          success:false,
          errMsg: finalResults.deleteFile.errMsg
        })
      }
    }
  })
});
//收藏动态
router.post("/chat/collect", function(req, res){
  async.auto({
    getChatItemContent: function (callback) {
      //把收藏这条消息的人push到这条消息的collect数组中
      chat.find({chatRecordId: req.body.chatRecordId}, function (err, chatResults) {
        if(err){
          callback(null)
          return console.error(err)
        }else{
          for(var j = 0; j < chatResults[0].chatItem.length; j++){
            if(chatResults[0].chatItem[j].chatItemId == req.body.chatItemId){
              chatResults[0].chatItem[j].collect.push({
                collectId: chatResults[0].chatItem[j].collect.length +1,
                user:{
                  id: req.session.user.userId,
                  name: req.session.user.nickName,
                  avatar: req.session.user.avatar
                }
              });
              chatResults[0].chatItem[j].markModified('collect');
              chatResults[0].save(function (err, saveResult) {
                if(err){
                  return console.error(err)
                }else{
                  //console.log('save collect', saveResult)
                }
              });
              callback(null,chatResults[0].chatItem[j]);
              break;
            }
          }
        }
      })
    },
    checkUser: ['getChatItemContent',function (results,callback) {
      //检查是不是该话题的主人
      console.log('chatItem', results.getChatItemContent)
      topic.find({topicId: req.body.topicId}, function (err, topicResults) {
        if(topicResults[0].owner.id == req.body.userId){
          topicResults[0].summarys.push({
            fileName: req.body.fileName,
            chatType: req.body.chatType,
            chatItemId:req.body.chatItemId,
            chatRecordId: req.body.chatRecordId,
            chatContent: results.getChatItemContent.chatContent,
            user:{
              id: results.getChatItemContent.user.id,
              name: results.getChatItemContent.user.name,
              avatar: results.getChatItemContent.user.avatar
            },
            createAt: results.getChatItemContent.createAt
          });
          topicResults[0].markModified('summarys');
          topicResults[0].save(function (err, saveresults) {
            if(err){
              callback(null,'err');
              return console.error(err)
            }
          });
          //并且也要存到user的collections里面
          user.find({userId: req.body.userId}, function (err, userResults) {
            if(err){
              return console.error(err)
            }
            userResults[0].collections.push({
              fileName: req.body.fileName,
              topicId: req.body.topicId,
              chatType: req.body.chatType,
              chatItemId: req.body.chatItemId,
              chatRecordId: req.body.chatRecordId,
              chatContent:results.getChatItemContent.chatContent,
              user:{
                id: results.getChatItemContent.user.id,
                name: results.getChatItemContent.user.name,
                avatar: results.getChatItemContent.user.avatar
              },
              createAt: results.getChatItemContent.createAt
            });
            userResults[0].markModified('collections')
            userResults[0].save(function (err, saveresults) {
              if(err){
                return console.error(err)
              }
            })
          });
          callback(null,{
            host:true,
            summary: results.getChatItemContent
          })
        }else{
          user.find({userId:req.session.user.userId}, function(err,userResults){
            if(err){
              callback(null,'err')
              return console.error(err)
            }
            userResults[0].collections.push({
              topicId: req.body.topicId,
              chatType: req.body.chatType,
              chatItemId: req.body.chatItemId,
              chatRecordId: req.body.chatRecordId,
              chatContent:results.getChatItemContent.chatContent,
              fileName: req.body.fileName,
              user:{
                id: results.getChatItemContent.user.id,
                name: results.getChatItemContent.user.name,
                avatar: results.getChatItemContent.user.avatar
              },
              createAt: results.getChatItemContent.createAt
            });
            userResults[0].markModified('collections')
            userResults[0].save(function (err, saveresults) {
              if(err){
                callback(null,'err');
                return console.error(err)
              }
              callback(null,{
                host:false,
                summary:results.getChatItemContent
              })
            })
          })
        }
      })
    }]
  }, function (err, finalResults) {
    //console.log('finalResults', finalResults)
    if(err){
      return res.send({
        success:false
      })
    }
    res.send({
      success:true,
      summary: finalResults.checkUser,
      chatItemId: finalResults.getChatItemContent.chatItemId
    })
  })
});


//取消收藏动态
//这个比较麻烦一点，要检查是不是话题主，话题主不光要删除自己的collections，还要删除topic的summary和chatItem中的数据。
// 如果不是话题主的话，就是删除自己的collections和chatItem的collect中自己的数据
router.post('/chat/discollect', function (req, res) {
  async.auto({
    checkHost: function (callback) {
      topic.find({topicId: req.body.topicId}, function (err, topicResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg:'not found topic'
          })
          return console.error(err)
        }else{
          if(topicResults[0].owner.id == req.body.userId){
            callback(null,{
              host: true,
              topicResult: topicResults[0]
            })
          }else{
            callback(null,{
              host:false
            })
          }
        }
      })
    },
    updateTopic:['checkHost', function (results, callback) {
      console.log('host')
      if(results.checkHost.host){
        var topicResult = results.checkHost.topicResult
        //说明是话题主，那么要把话题中的summary中相关的删掉
        for(var i = 0; i< topicResult.summarys; i++){
          if(req.body.chatItemId == topicResult.summarys[i].chatItemId){
            break
          }
        }
        if(i < topicResult.summarys.length){
          topicResult.summarys.splice(i,1)
          topicResult.markModified('summarys');
          topicResult.save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: false,
                errMsg:'save err'
              })
              return console.error(err)
            }else{
              callback(null,{
                success: true
              })
            }
          })
        }else{
          callback(null,{
            success: false,
            errMsg:'not found'
          })
        }
      }else{
        callback(null,{
          success:true,
          msg:'not host'
        })
      }
    }],
    updateUser: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        //console.log('userREsults',userResults[0].collections)
        if(err){
          callback(null,{
            success: false,
            errMsg:'not found user'
          })
          return console.error(err)
        }else{
          var collections = userResults[0].collections;
          for(var i = 0; i < collections.length; i++){
            if(collections[i].chatItemId == req.body.chatItemId && collections[i].chatRecordId == req.body.chatRecordId){
              //console.log('collections找到了')
              break
            }
          }
          if(i < collections.length){
            collections.splice(i,1);
            userResults[0].markModified('collections');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success:false,
                  errMsg:'save err'
                })
              }else{
                callback(null,{
                  success: true
                })
              }
            })
          }else{
            callback(null,{
              success: false,
              errMsg:'not found in collections'
            })
          }
        }
      })
    },
    updateChatRecordItem: function (callback) {
      chat.find({chatRecordId: req.body.chatRecordId}, function(err, chatResults){
        var chats = chatResults[0].chatItem;
        for(var i = 0; i < chats.length; i++){
          if(chats[i].chatItemId == req.body.chatItemId){
            for(var j = 0; j< chats[i].collect.length; j++){
              if(chats[i].collect[j].user.id == req.body.userId){
                break;
              }
            }
            break;
          }
        }

        if(i < chats.length && j < chats[i].collect.length){
          chats[i].collect.splice(j,1)
          chatResults[0].markModified('chatItem');
          chatResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: fasle,
                errMsg:'save err'
              })
            }else{
              callback(null,{
                success:true
              })
            }
          })
        }else{
          callback(null,{
            success: false,
            errMsg:'not found'
          })
        }

      })
    }
  }, function (err, finalReults) {
    if(err){
      res.send({
        success: false,
        errMsg:'err'
      })
    }else{
      if(finalReults.checkHost.host){
        if(finalReults.updateTopic && finalReults.updateUser && finalReults.updateChatRecordItem){
          res.send({
            success: true,
            host:true
          })
        }else{
          res.send({
            success: false,
            msg:'更新失败'
          })
        }
      }else{
        if(finalReults.updateTopic && finalReults.updateUser && finalReults.updateChatRecordItem){
          res.send({
            success: true,
            host:false
          })
        }else{
          res.send({
            success: false,
            msg:'更新失败'
          })
        }
      }
    }
  })
});
router.post("/setting/topic", function(req, res){
  async.auto({
    updateTopic: function (callback) {
      if(req.body.set_type == 1){
        topic.find({topicId: req.body.topicId}, function (err, topicResults) {
          if(err){
            callback(null,'err');
            return console.error(err)
          }
          topicResults[0].title = req.body.title;
          topicResults[0].brief = req.body.brief;
          topicResults[0].endAt = req.body.endAt;
          topicResults[0].markModified('title');
          topicResults[0].markModified('brief');
          topicResults[0].markModified('endAt');
          topicResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,'save err');
              return console.error(err)
            }
            callback(null, saveResult);
          })
        })
      }else if(req.body.set_type == 2){
        topic.find({topicId: req.body.topicId}, function (err, topicResults) {
          if(err){
            callback(null,'err')
            return console.error(err)
          }
          topicResults[0].condition = 1;
          topicResults[0].markModified('condition');
          topicResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,'save err')
              return console.error(err)
            }
            callback(null, saveResult)
          })
        })
      }else{
        callback(null)
      }
    }
  }, function (err, finalResults) {
    //console.log('finalresults', finalResults)
    if(err){
      console.error(err);
      res.send({
        success: false
      })
    }else{
      res.send({
        success:true,
        updateTopic: finalResults.updateTopic
      })
    }

  })
});

router.post("/file/topic", function(req, res){
  async.auto({
    updateTopic: function(callback){
      topic.find({topicId: req.body.topicId}, function (err, topicResults) {
        topicResults[0].files.push({
          file_type: req.body.file_type,
          fileName:req.body.fileName,
          source: req.body.source,
          uploader: {
            id: req.session.user.userId,
            name: req.session.user.nickName
          }
        });
        var fileObj = {
          file_type: req.body.file_type,
          fileName:req.body.fileName,
          source: req.body.source,
          uploader: {
            id: req.session.user.userId,
            name: req.session.user.nickName
          }
        };
        topicResults[0].markModified('files');
        topicResults[0].save(function (err, result) {
          //console.log('file save result', result)
          if(err){
            callback(null, 'save err')
            return console.error(err)
          }
          callback(null, fileObj)
        })
      })
    }
  }, function (err, finalResults) {
    if(err){
      res.send({
        success: false
      });
      return console.error(err)
    }else{
      res.send({
        success: true,
        file: finalResults.updateTopic
      })
    }
  })
});

//删除话题中的成员
router.post("/delete/topic", function (req, res) {
  async.auto({
    updateTopic: function (callback) {
      topic.find({topicId: req.body.topicId}, function (err, topicResults) {
        if(err){
          callback(null, {
            success: false,
            err: 'find err'
          })
          return console.error(err)
        }
        var index = -1;
        var i = 0;
        for(i ; i< topicResults[0].members.length; i++){
          if(topicResults[0].members[i].userId == req.body.userId){
            index = i;
            break;
          }
        }
        if(index != -1){
          topicResults[0].members.splice(index,1)
          topicResults[0].markModified('members');
          topicResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: false,
                err:'save err'
              });
              return console.error(err)
            }
            callback(null, {
              success: true
            })
          })
        }else{
          return callback(null,'not found this user')
        }
      })
    },
    updateUser: function (callback) {
      user.find({userId: req.body.userId}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            err:'find err'
          })
          return console.error(err)
        }
        var index=-1;
        var i=0;
        for(i; i< userResults[0].topics.length; i++){
          if(userResults[0].topics[i].topicId == req.body.topicId){
            index = i;
            break;
          }
        }
        if(index != -1){
          userResults[0].topics.splice(index,1);
          userResults[0].markModified('topics');
          userResults[0].save(function (err, saveReult) {
            if(err){
              callback(null,{
                success: false,
                err:'save err'
              })
              return console.error(err)
            }
            callback(null, {
              success: true
            })
          })
        }else{
          return callback(null, 'not found this topic')
        }

      })
    }
  }, function (err, finalResults) {
    if(err){
      return res.send({
        success: false
      })
    }else{
      //if(finalResults.updateTopic.success == 'true' && finalResults.updateUser.success == 'true'){
      //  res.send({
      //    success: true
      //  })
      //}else{
      //  res.send({
      //    success:false
      //  })
      //}
      res.send({
        success: true
      })
    }
  })
});
//获取聊天记录
router.post("/mousewheel/chat", function (req, res) {
  console.log('get history data')
  var chatItemId = req.body.chatItemId;
  var chatRecordId = req.body.chatRecordId;
  var chatCount = req.body.chatCount;
  async.auto({
    getHistChat: function (callback) {
      //获取历史聊天记录
      if(req.body.summary == 'false'){
        //获取之前的聊天信息，用在摘要部分和聊天框部分
        if(req.body.up == 'true'){
          chat.find({chatRecordId: chatRecordId}, function (err, chatResults) {
            if(err){
              callback(null,'find err')
              return console.error(err)
            }
            //var arr= chatResults[0].chatItem.slice(chatResults[0].chatItem.length-chatCount-5,-chatItemId);
            var start ;
            if(chatItemId-10 < 0){
              start = 0
            }else{
              start = chatItemId-10
            }
            var arr= chatResults[0].chatItem.slice(start,chatItemId-1);
            //console.log('arr',arr)
            callback(null,{
              arr:arr,
              chatRecordId: chatRecordId
            })
          });
        }else{
          //也就是得到下面的聊天数据，只用在摘要部分的
          chat.find({chatRecordId: chatRecordId}, function (err, chatResults) {
            if(err){
              callback(null,'find err');
              return console.log(err)
            }

            var arr = chatResults[0].chatItem.slice(chatItemId, chatItemId+10);
            console.log('arr',arr.length);
            callback(null,{
              arr:arr,
              chatRecordId: chatRecordId
            })
          })
        }

      }else{
        callback(null)
      }
    },
    getSummayPartChat:function(callback){
      //获取摘要的上下文（聊天记录）
      if(req.body.summary =='true'){
        chat.find({chatRecordId: chatRecordId}, function (err, chatResults) {
          if(err){
            callback(null,'find err')
            return console.error(err)
          }
          var chatItem = chatResults[0].chatItem;
          var i = chatItemId-3;
          if(i < 0){
            i = 0
          }
          var arr=chatItem.slice(i,i+5);
          console.log('上下文',i,i+5)
          callback(null,{
            chatRecordId: chatRecordId,
            summaryArr: arr,
            chatItemId: chatItemId
          })
        })
      }else{
        callback(null)
      }
    }
  }, function (err, finalResults) {
    console.log('get hischat finalResults', finalResults)
    if(err){
      return res.send({
        success:false
      })
    }else{
      if(req.body.summary =='false'){
        return res.send({
          success:true,
          hisChat: finalResults.getHistChat.arr,
          chatRecordId: chatRecordId
        })
      }else{
        return res.send({
          success:true,
          chatRecordId: chatRecordId,
          summaryChat: finalResults.getSummayPartChat.summaryArr,
          chatItemId: finalResults.getSummayPartChat.chatItemId
        })
      }
    }


  })
});

//要把自己删掉
router.get("/members/topic", function (req, res) {
  topic.find({topicId: req.query.topicId}, function (err, topicResults) {
    if(err){
      return console.error(err)
    }else{
      for(var i = 0; i < topicResults[0].members.length; i++){
        if(topicResults[0].members[i].userId == req.session.user.userId){
          break;
        }
      }
      if(i == topicResults[0].members.length){
        res.send(topicResults[0].members)
      }
      //else if(i == 0){
      //  topicResults[0].members.splice(i,1);
      //  res.send(topicResults[0].members)
      //}
      else{
        topicResults[0].members.splice(i,1);
        res.send(topicResults[0].members)
      }
    }
  })
});

//收藏文件
router.post('/topic/file/collect', function (req, res) {
  console.log('server collect')
  async.auto({
    updateUser: function(callback){
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          userResults[0].TopicFileCollections.push({
            topicId: req.body.topicId,
            file_id: req.body.file_id
          });
          userResults[0].markModified('TopicFileCollections');
          userResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: false,
                errMsg: 'save err'
              })
            }else{
              callback(null,{
                success: true
              })
            }
          })
        }
      })
    },
    updateTopic: function (callback) {
      topic.find({topicId: req.body.topicId}, function (err, topicResults) {
        if(err){
         callback(null,{
           success: false,
           errMsg: 'find err'
         })
          return console.error(err)
        }else{
          topicResults[0].files.forEach(function (obj, i, arr) {
            if(obj._id == req.body.file_id){
              obj.collectors.push({
                userId: req.session.user.userId
              })
            }
          })
          topicResults[0].markModified('files');
          topicResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: false,
                errMsg: 'save err'
              })
            }else{
              callback(null,{
                success: true
              })
            }
          })
        }
      })
    }
  }, function (err, finalResults) {
    if(err){
      res.send({
        success: false
      })
    }else{
      if(finalResults.updateUser.success && finalResults.updateTopic.success){
        res.send({
          success: true
        })
      }else{
        res.send({
          success: false
        })
      }
    }
  })
});

router.post('/topic/file/cancel', function(req, res){
  async.auto({
    updateUser: function(callback){
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          var TopicFileCollections = userResults[0].TopicFileCollections;
          for(var i = 0; i< TopicFileCollections.length; i++){
            if(TopicFileCollections[i].file_id == req.body.file_id){
              break;
            }
          }
          if(i < TopicFileCollections.length){
            userResults[0].TopicFileCollections.splice(i, 1);
            userResults[0].markModified('TopicFileCollections');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: 'save err'
                })
              }else{
                callback(null,{
                  success: true
                })
              }
            })
          }else{
            callback(null)
          }
        }
      })
    },
    updateTopic: function (callback) {
      topic.find({topicId: req.body.topicId}, function(err, topicResults){
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          for(var j = 0; j< topicResults[0].files.length; j++){
            if(topicResults[0].files[j]._id == req.body.file_id){
              break;
            }
          }
          if(j < topicResults[0].files.length){
            for(var m = 0; m < topicResults[0].files[j].collectors.length; m++){
              if(topicResults[0].files[j].collectors[m].userId == req.session.user.userId){
                break;
              }
            }
            if( m < topicResults[0].files[j].collectors.length ){
              topicResults[0].files[j].collectors.splice(m ,1);
              topicResults[0].markModified('files');
              topicResults[0].save(function (err, saveResult) {
                if(err){
                  callback(null,{
                    success: false,
                    errMsg: 'save err'
                  })
                  return console.error(err)
                }else{
                  callback(null,{
                    success: true
                  })
                }
              })
            }
          }else{
            callback(null)
          }
        }
      })
    }
  }, function (err, finalResults) {
    if(err){
      res.send({
        success: false
      })
    }else{
      if(finalResults.updateUser.success && finalResults.updateTopic.success){
        res.send({
          success: true
        })
      }else{
        res.send({
          success: false
        })
      }
    }
  })
})
module.exports = router;
