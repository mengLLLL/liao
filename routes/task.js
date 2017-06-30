/**
 * Created by MengL on 2016/12/10.
 */
var express = require('express');
var router = express.Router();
var user = require('../mongoDB/models/user.js');
var team = require('../mongoDB/models/team.js');
var topic = require('../mongoDB/models/topic.js');
var task = require('../mongoDB/models/task.js');
var async = require('async');
var moment = require('moment')

//创建task
//保存该task，然后更新其创建者的user的tasks字段
router.post("/create/task", function (req, res) {
  async.auto({
    getTaskId: function (callback) {
      task.count(function (err, count) {
        if(err){
          callback(null,'err')
          return console.error(err)
        }else{
          callback(null, count+1)
        }
      })
    },
    saveTask: ['getTaskId',function (results,callback) {
      //console.log('req body', req.body)
      if(req.body.hasTopic == "false"){
        var newTask = new task({
          title: req.body.taskTitle,
          brief: req.body.taskBrief,
          owner: {
            id: req.session.user.userId,
            //name: req.session.user.nickName,
            //avatar: req.session.user.avatar
          },
          taskId: results.getTaskId,
          teamId: req.session.team.teamId,
          endAt: req.body.endAt
        });
        newTask.members.push({
          userId: req.session.user.userId,
          //name: req.session.user.nickName,
          //avatar: req.session.user.avatar
        });
        newTask.save(function (err, result) {
          if(err){
            console.error(err);
            return callback(null,'err')
          }
          team.update({teamId: req.session.team.teamId}, {$push:{"tasks": result.taskId}}, function(err){});
          callback(null, result)
        })
      }else{
        console.log('true');
        var newTask2 = new task({
          title: req.body.taskTitle,
          brief: req.body.taskBrief,
          owner: {
            id: req.session.user.userId,
            //name: req.session.user.nickName,
            //avatar: req.session.user.avatar

          },
          taskId: results.getTaskId,
          teamId: req.session.team.teamId,
          topicId: req.body.topicId,
          endAt: req.body.endAt
        });
        newTask2.members.push({
          userId: req.session.user.userId,
          //name: req.session.user.nickName,
          //avatar: req.session.user.avatar

        });
        newTask2.save(function (err, newTask2result) {
          if(err){
            console.error(err);
            return callback(null,'err')
          }
          team.update({teamId: req.session.team.teamId}, {$push:{"tasks": newTask2result.taskId}}, function(err){});
          topic.find({topicId: req.body.topicId}, function (err, topicResults) {
            if(err){
              return console.error(err)
            }
            topicResults[0].taskArr.push({
              taskId: newTask2result.taskId
            });
            topicResults[0].markModified('taskArr');
            topicResults[0].save(function (err, saveResults) {
              if(err){
                return console.error(err)
              }
            })
          });
          callback(null, newTask2result)

        })
      }

    }],
    updateUserTask: ['saveTask', function (results, callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          console.error(err);
          return callback(null,'err')
        }
        userResults[0].tasks.push({
          taskId: results.saveTask.taskId
        });
        userResults[0].markModified('tasks');
        userResults[0].save(function (err, result) {
          if(err){
            console.error(err);
            return callback(null,'err')
          }
          console.log('user update', result)
          callback(null,result)
        })
      })
    }],
  }, function (err, finalResults) {
    if(err){
      res.send({
        success:false,
      })
      return console.error(err)
    }else{
      res.send({
        success: true,
        taskId: finalResults.saveTask.taskId
      })
    }
  })
});

//检查任务是否已经逾期，逾期要改状态和统计的数字
router.get('/task', function (req, res) {
  var taskId = req.query.taskId;
  async.auto({
    getTask: function(callback){
      //console.log('taskId getTAsk', taskId)
      task.find({taskId: taskId}, function (err, taskResults) {
        if(err){
          console.error(err);
          return callback(null,'err')
        }
        callback(null, taskResults[0])
      })
    },
    getTaskNodeOwnerMsg: ['getTask', function (results, callback) {
      //获取每个任务节点的user的信息
      //TODO  这里真心搞不懂为什么会影响最后的结果呢
      //console.log('task', results.getTask)
      var taskArr = results.getTask.taskArr;
      async.map(taskArr, function (item, cb) {
        async.map(item.users, function (userItem, scb) {
          user.find({userId: userItem.id}, function (err, userResults) {
            if(err){
              scb(null, 'map user err')
            }else{
              userItem.name = userResults[0].nickName;
              userItem.avatar = userResults[0].avatar;
              scb(null, userItem)
            }
          })
        })
        cb(null)
      }, function (err, mapResults) {
        if(err){
          callback(null,'map err')
        }else{
          callback(null)
        }
      });
    }],
    getTaskMembers:['getTask', function (results, callback) {
      var taskObj = results.getTask;
      async.map(taskObj.members, function (item, cb) {
        user.find({userId: item.userId}, function (err, userResults) {
          if(err){
            cb(null,'err')
          }else{
            cb(null,{
              userId: item.userId,
              name: userResults[0].nickName,
              realName: userResults[0].realName.name,
              avatar: userResults[0].avatar
            })
          }
        })
      }, function(err, mapResults){
        //console.log('mapREsults ds',mapResults)
        if(err){
          callback(null,{
            success: false,
            errMsg:'map err'
          });
          return console.error(err)
        }else{
          callback(null,mapResults)
        }
      })
    }],
    updateConditionNotice:['getTask', function (results, callback) {
      var taskObj = results.getTask;
      for(var i = 0; i< taskObj.newConditionNotice.length; i++){
        if(req.session.user.userId == taskObj.newConditionNotice[i].userId){
          break;
        }
      }
      if(i < taskObj.newConditionNotice.length){
        //说明在被通知的用户数组里面，那么就得删掉
        taskObj.newConditionNotice.splice(i,1);
        taskObj.markModified('newConditionNotice');
        taskObj.save(function (err, saveResult) {
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
      }else{
        callback(null)
      }
    }],
    updateNewTaskNotice:['getTask', function (results, callback) {
      var taskObj = results.getTask;
      for(var i = 0; i< taskObj.newTaskNotice.length; i++){
        if(req.session.user.userId == taskObj.newTaskNotice[i].userId){
          break;
        }
      }
      if(i < taskObj.newTaskNotice.length){
        taskObj.newTaskNotice.splice(i,1);
        taskObj.markModified('newTaskNotice');
        taskObj.save(function (err, saveResult) {
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
      }else{
        callback(null)
      }
    }],
    updateOverdue:['getTask', function (results, callback) {
      //把逾期的任务节点的状态更改掉,还要改掉用户里面这个任务的状态
      var taskObj = results.getTask;
      var overdueTaskItem = [];
      taskObj.taskArr.forEach(function (obj, i, arr) {
        if(!moment().isBefore(obj.endAt) && obj.condition == 0){
          overdueTaskItem.push(obj);
          obj.condition = 2;
        }
      });
      taskObj.markModified('taskArr');
      taskObj.save(function (err, saveResult) {
        if(err){
          console.log(err);
          callback(null,{
            success: false,
            errMsg: 'save err'
          })
        }else{
          callback(null,{
            success: true,
            updateOverdue: overdueTaskItem
          })
        }
      })
    }],
    updateUserOverdue: ['getTask','updateOverdue', function (results, callback) {
      console.log('逾期任务', results.updateOverdue.updateOverdue)
      if(results.updateOverdue.success && results.updateOverdue.updateOverdue.length > 0){
        var taskItems = results.updateOverdue.updateOverdue;
        user.find({userId: req.session.user.userId}, function (err, userResults) {
          if(err){
            console.log('err',err)
            callback(null,{
              success: false,
              errMsg: 'find user err'
            })
          }else{
            for(var j = 0; j< userResults[0].taskArr.length; j++){
              //console.log('for',taskId);
              if(userResults[0].taskArr[j].taskId == taskId){
                taskItems.forEach(function (obj, i, arr) {
                  for(var m = 0; m< userResults[0].taskArr[j].taskItems.length; m++){
                    if(obj.taskItemId == userResults[0].taskArr[j].taskItems[m].taskItemId){
                      userResults[0].taskArr[j].taskItems[m].condition = 2;
                    }
                  }
                });
                break;
              }
            }
            userResults[0].markModified('taskArr');
            userResults[0].save(function (err, saveResults) {
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
        })

      }else{
        callback(null)
      }
    }],
    checkOverdue: ['getTask', function (results, callback) {
      //统计逾期的任务数
      //console.log('checke')
      async.map(results.getTask.taskArr, function (item, cb) {
        //console.log('checkOverdue',!moment().isBefore(item.endAt))
        if(!moment().isBefore(item.endAt)){
          //逾期
          cb(null, 1)
        }else{
          cb(null, 0)

        }
      }, function (err, results) {
        if(err){
          callback(null,'err');
          return console.error(err)
        }
        var j = 0;
        results.forEach(function (item, i, arr) {
          if(item == 1){
           j++
          }
        });
        if(j>0){
          //console.log('kjjjjjjj',j)
          task.find({taskId: taskId}, function (err, taskResults) {
            if(err){
              console.error(err)
              return callback(null,'err')
            }
            taskResults[0].statistics = {
              sum: taskResults[0].statistics.sum,
              working: taskResults[0].statistics.working,
              overdue: j,
              finished:taskResults[0].statistics.finished,
              percent: parseInt(taskResults[0].statistics.finished/taskResults[0].statistics.sum*100)
            };
            taskResults[0].markModified('statistics');
            taskResults[0].save(function(err, result){
              if(err){
                console.error(err)
                return callback(null,'save err')
              }
              callback(null)
            })
          })
        }else{
          callback(null)
        }
      })
    }],
    getSubTopic:['getTask', function (results, callback) {
      //console.log('getSubTopic', results);
      if(results.getTask.topicArr.length > 0){
        var topicArr = [];
        async.map(results.getTask.topicArr, function (item, cb) {
          topic.find({topicId: item.topicId}, function (err, topicResults) {
            if(err){
              cb(null,'err')
            }
            cb(null, topicResults[0])
          })

        }, function(err, mapResults){
          //console.log('mapresults', mapResults)
          if(err){
            callback(null,'err')
            return console.error(err)
          }
          callback(null, mapResults)
        })
      }else{
        callback(null)
      }
    }],
    getSubTopicOwnerMsg: ['getSubTopic', function (results, callback) {
      var topics = results.getSubTopic;
      async.map(topics, function(item, cb){
        user.find({userId: item.owner.id}, function(err, userResults){
          if(err){
            cb(null, 'find err')
          }else{
            item.owner.name = userResults[0].nickName;
            item.owner.avatar = userResults[0].avatar;
            cb(null, item)
          }
        })
      }, function (err, mapResults) {
        if(err){
          callback(null,'map err')
        }else{
          callback(null)
        }
      });
    }]
  }, function (err, finalResults) {
    if(err){
      console.error(err);
      return res.render('task',{
      })
    }
    res.render('task',{
      task: finalResults.getTask,
      subTopic: finalResults.getSubTopic,
      taskMembers: finalResults.getTaskMembers
    })
  })
});

//创建一个任务节点,这个时候去该统计字段
router.post('/add/node', function (req, res) {
  var endTime = req.body.endTime;
  var taskId = req.body.taskId;
  var members = req.body.members;
  var brief = req.body.brief;
  async.auto({
    tasknodeOwner: function (callback) {
      async.map(members, function (item, cb) {
        user.find({userId: item.id}, function(err, userResults){
          if(err){
            cb(null,'find err')
          }else{
            cb(null, userResults[0])
          }
        })
      }, function (err, mapResults) {
        console.log('map user', mapResults)
        if(err){
          callback(null, 'map err')
        }else{
          callback(null, mapResults)
        }
      })
    },
    updateTask: function (callback) {
      task.find({taskId: taskId}, function(err, taskResults){
        if(err){
          console.log(err);
          return callback(null,'err')
        }
        var taskItemId = taskResults[0].taskArr.length + 1;
        var taskItem = {
          taskItemId: taskItemId,
          users: members,
          endAt: endTime,
          brief: brief
        };
        taskResults[0].taskArr.push({
          taskItemId: taskItemId,
          users: members,
          endAt: endTime,
          brief: brief,
          creater:{
            userId: req.session.user.userId
            //name: req.session.user.nickName
          }
        });

        taskResults[0].markModified('taskArr');
        //往task的members数组中添加成员的时候要验证一下是不是已经存在
        async.map(members, function (item, cb) {
          var j=0;
          for(j; j < taskResults[0].members.length; j++){
            if(item.id == taskResults[0].members[j].userId){
              break;
            }
          }
          if(j == taskResults[0].members.length){
            taskResults[0].members.push({
              userId: item.id,
              //name: item.name
            });
            taskResults[0].markModified('members');
            cb(null,'new user')
          }else{
            cb(null,'existed');
          }
        }, function (err, mapResults) {
          if(err){
            return console.error(err)
          }
        });

        taskResults[0].statistics = {
          sum: taskResults[0].statistics.sum + 1,
          working: taskResults[0].statistics.working + 1,
          finished: taskResults[0].statistics.finished,
          overdue: taskResults[0].statistics.overdue,
          percent: parseInt(taskResults[0].statistics.finished/(taskResults[0].statistics.sum + 1)*100)
        };
        taskResults[0].save(function (err, result) {
          if(err){
            callback(null,'save err')
            return console.error(err)
          }
        })
        callback(null, {
          task: taskResults[0],
          taskItemId: taskItemId,
          taskItem: taskItem
        })
      })
    },
    updateUser: ['updateTask', function (results, callback) {
      async.map(members, function (item, cb) {
        user.find({userId: item.id}, function (err, userResults) {
          if(err){
            cb(null,'err');
            return console.error(err)
          }
          var i=0;
          for(i; i< userResults[0].taskArr.length; i++){
            if(userResults[0].taskArr[i].taskId == taskId){
              userResults[0].taskArr[i].taskItems.push({
                taskItemId: results.updateTask.taskItemId
              });
              userResults[0].markModified('taskArr');
              break;
            }
          }
          if(i == userResults[0].taskArr.length){
            userResults[0].taskArr.push({
              taskId: taskId,
              taskItems:[{
                taskItemId: results.updateTask.taskItemId,
                condition: 0
              }]
            });
          }
          userResults[0].notification.push({
            msg_type: 7,
            from:{
              id: req.session.user.userId,
              //name: req.session.user.nickName
            },
            content: results.updateTask.taskItem.brief,
            id:userResults[0].notification.length + 1
          });
          userResults[0].markModified('taskArr');
          userResults[0].save(function (err, result) {
            if(err){
              cb(null,'save err')
              return console.error(err)
            }
            cb(null, userResults[0])
          })
        })
      }, function (err, mapResults) {
        if(err){
          callback(null, 'update failed')
          return console.error(err)
        }
        callback(null,'true')
      })
    }],
    updateNotice: function (callback) {
      task.find({taskId: req.body.taskId}, function(err, taskResults){
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          req.body.members.forEach(function (obj, i, arr) {
            if(taskResults[0].newTaskNotice.length == 0){
              taskResults[0].newTaskNotice.push({
                userId: obj.id
              })
            }else{
              for(var j = 0; j< taskResults[0].newTaskNotice.length; j++){
                if(taskResults[0].newTaskNotice[j].userId == obj.id){
                  break
                }
              }
              if(j == taskResults[0].newTaskNotice.length){
                //不存在，push
                taskResults[0].newTaskNotice.push({
                  userId: obj.id
                })
              }
            }
          })

          taskResults[0].markModified('newTaskNotice');
          taskResults[0].save(function (err, saveResult) {
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
      })
    }
  }, function (err, finalResults) {
    //console.log('hahahaha', finalResults)
    if(err){
      res.send({
        success: false
      })
      return console.error(err)
    }else{
      res.send({
        success: true,
        task: finalResults.updateTask.task,
        taskItem: finalResults.updateTask.taskItem,
        nodeUsers: finalResults.tasknodeOwner
      })
    }
  });
});
//TODO 更新用户的taskArr的该item的状态，返回值ajax更新已完成的数目
router.post("/finish/taskitem", function (req, res) {
  async.auto({
    updateTask: function (callback) {
      task.find({taskId: req.body.taskId}, function (err, taskResults) {
        if(err){
          console.error(err);
          return callback(null,'find err')
        }
        async.map(taskResults[0].taskArr, function (item, cb) {
          if(item.taskItemId == req.body.taskItemId){
            console.log('req.body.taskItemId', req.body.taskItemId);
            cb(null, item.users);
            if(item.condition == 2){
              taskResults[0].statistics.overdue = taskResults[0].statistics.overdue-1;
            }
            item.condition = 1;
            //item.markModified('condition');
            taskResults[0].statistics.finished = taskResults[0].statistics.finished+1;
            taskResults[0].statistics.working = taskResults[0].statistics.working-1;
            taskResults[0].statistics.percent = parseInt(taskResults[0].statistics.finished/taskResults[0].statistics.sum*100)
            taskResults[0].markModified('statistics');
            taskResults[0].markModified('taskArr');
            taskResults[0].save(function (err, result) {
              //console.log('_id'. result._id)
              if(err){
                console.error('save err',err);
              }
            });
          }else{
            cb(null,0)
          }
        }, function (err, results) {
          if(err){
            return console.error(err)
          }else{
            var j=0;
            for(j; j< results.length; j++){
              if(results[j] !== 0){
                callback(null, {
                  users: results[j],
                  task: taskResults[0]
                });
                break
              }
            }
            if(j == results.length){
              return callback(null,'err')
            }
          }
        })
      })
    },
    updateUsers: ['updateTask', function(results, callback){
      var users = results.updateTask.users;
      async.map(users, function (item, cb) {
        user.find({userId: item.id}, function (err, userResults) {
          if(err){
            return console.error(err)
          }
          userResults[0].taskArr.forEach(function (obj, i, arr) {
            if(obj.taskId == req.body.taskId){
              obj.taskItems.forEach(function (s_obj, j, arr) {
                if(s_obj.taskItemId == req.body.taskItemId){
                  s_obj.condition=1
                }
              })
            }
          });
          userResults[0].markModified('taskArr');
          userResults[0].save(function (err, result) {
            if(err){
              cb(null,'err');
              return console.error(err)
            }else{
              cb(null, result)
            }
          })
        })
      }, function (err, mapResults) {
        if(err){
          return callback(null, 'err')
        }else{
          callback(null, mapResults)
        }
      })
    }],
    sendNotiToTaskHost: ['updateTask', 'updateUsers', function (results, callback) {
      //console.log('sendNotiToTaskHost', results);
      var userId = results.updateTask.task.owner.id;
      var task = results.updateTask.task;
      var content;
      var j=0;
      for(j; j< task.taskArr.length; j++){
        //console.log('task.taskArr',task.taskArr[j] )
        if(task.taskArr[j].taskItemId == req.body.taskItemId){
          content = task.taskArr[j].brief;
          break;
        }
      }
      //console.log('content', content,j,task.taskArr.length)
      if(j !== task.taskArr.length){
        //也就是找到了
        user.find({userId: userId}, function (err, userResults) {
          if(err){
            callback(null, 'find err')
            return console.error(err)
          }
          userResults[0].notification.push({
            msg_type:8,
            content: content,
            task:{
              users: results.updateTask.users,
              taskId: req.body.taskId,
              taskItemId: req.body.taskItemId
            },
            id: userResults[0].notification.length+1
          });
          userResults[0].markModified('notification');
          userResults[0].save(function (err, result) {
            if(err){
              callback(null,'err')
              return console.error(err)
            }else{
              return callback(null)
            }
          })
        });
      }else{
        callback(null,'err')
      }
    }],
    updateTaskNoticeArr: function(callback){
      task.find({taskId: req.body.taskId}, function (err, taskResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg:'find err'
          })
        }else{
          if(taskResults[0].newConditionNotice.length == 0){
            //待通知的数组为空，那么就要直接去插入就行了
            taskResults[0].members.forEach(function (obj, i, arr) {
              if(obj.userId !== req.session.user.userId){
                taskResults[0].newConditionNotice.push({
                  userId: obj.userId
                })
              }
            });
            taskResults[0].markModified('newConditionNotice');
            taskResults[0].save(function (err, saveResults) {
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
          }else{
            //待通知的数组不为空,那么遍历每个成员的时候就要去检查是不是已经在newConditionNotice里面或者该用户是不是完成任务的人
            taskResults[0].members.forEach(function (obj, i, arr) {
              for(var i = 0;i < taskResults[0].newConditionNotice.length; i++){
                if(taskResults[0].newConditionNotice[i].userId == obj.userId || obj.userId == req.session.user.userId){
                  break;
                }
              }

              if(i == taskResults[0].newConditionNotice.length){
                //也就是没有找到这个用户，那么就可以push到里面
                taskResults[0].newConditionNotice.push({
                  userId: obj.userId
                })
              }
            })
            taskResults[0].markModified('newConditionNotice');
            taskResults[0].save(function (err, saveResult) {
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
        }
      })
    }
  }, function (err, finalResults) {
    //console.log('finishedddddd finalResults', finalResults)
    if(err){
      return res.send({
        success: false
      })
      return console.error(err)
    }
    res.send({
      success: true,
      task: finalResults.updateTask.task,
      users: finalResults.updateTask.users
    })
  });

});

router.post("/setting/task", function (req, res) {
  async.auto({
    updateTask: function (callback) {
      if(req.body.set_type ==1){
        task.find({taskId: req.body.taskId}, function (err, taskResults) {
          if(err){
            callback(null,'err')
            return console.error(err)
          }
          taskResults[0].title = req.body.title;
          taskResults[0].brief = req.body.brief;
          taskResults[0].endAt = req.body.endAt;
          taskResults[0].markModified('title');
          taskResults[0].markModified('brief');
          taskResults[0].markModified('endAt');
          taskResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,'save err')
              return console.error(err)
            }
            callback(null, saveResult)
          })
        })
      }else if(req.body.set_type == 2){
        task.find({taskId: req.body.taskId}, function (err, taskResults) {
          if(err){
            callback(null, 'find err')
            return console.error(err)
          }
          taskResults[0].condition = 1;
          taskResults[0].markModified('condition');
          taskResults[0].save(function (err, saveResult) {
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
    if(err){
      console.error(err)
      return res.send({
        success:false
      })
    }else{
      res.send({
        success: true,
        updateTask: finalResults.updateTask
      })
    }
  })
});

//上传文件
router.post("/file/task", function (req, res) {
  async.auto({
    updateTask: function (callback) {
      task.find({taskId: req.body.taskId}, function (err, taskResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }
        taskResults[0].files.push({
          file_type: req.body.file_type,
          fileName: req.body.fileName,
          source: req.body.source,
          uploader:{
            id: req.session.user.userId,
            name:req.session.user.nickName
          }
        });
        taskResults[0].markModified('files');
        taskResults[0].save(function (err, saveResult) {
          if(err){
            callback(null, 'save err')
            return console.error(err)
          }
          callback(null, saveResult)
        })
      })
    }
  }, function (err, finalResults) {
    if(err){
      console.error(err)
      return res.send({
        success: false
      });
    }
    res.send({
      success:true,
      file: finalResults.updateTask
    })
  })
});
router.post('/task/delete/file', function (req, res) {
  async.auto({
    deleteFile: function (callback) {
      task.find({taskId: req.body.taskId}, function (err, taskResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg:'find err'
          })
        }else{
          for(var i = 0; i< taskResults[0].files.length; i++){
            if(req.body.file_id == taskResults[0].files[i]._id){
              console.log('找到啦');
              break;
            }
          }
          if(i < taskResults[0].files.length){
            //if(i == 0){
            //  taskResults[0].files.splice(i,1)
            //}else{
            //  taskResults[0].files.splice(i,1)
            //}
            taskResults[0].files.splice(i,1)
            taskResults[0].markModified('files');
            taskResults[0].save(function (err, saveResult) {
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
            });
          }else{
            callback(null,{
              success:false,
              errMsg:'not found file in task'
            })
          }
        }
      })
    }
  }, function (err, finalResults) {
    if(err){
      console.log('err', err)
      res.send({
        success: false
      })
    }else{
      if(finalResults.deleteFile.success == true){
        res.send({
          success: true
        })
      }else{
        res.send({
          success: false,
          errMsg: finalResults.deleteFile.errMsg
        })
      }
    }
  })
});

router.get('/tasks', function (req, res) {
  task.find({teamId: req.session.team.teamId}, function (err, taskResults) {
    if(err){
      res.send({
        success: false,
        errMsg:'not found'
      });
      return console.error(err)
    }else{
      res.send({
        success: true,
        tasks: taskResults
      })
    }
  })
});

//收藏文件
router.post('/task/file/collect', function (req, res) {
  console.log('req.body', req.body);
  async.auto({
    updateUser: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
        }else{
          userResults[0].TaskFileCollections.push({
            taskId: req.body.taskId,
            file_id: req.body.file_id
          });
          userResults[0].markModified('TaskFileCollections');
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
    updateTask: function(callback){
      task.find({taskId: req.body.taskId}, function (err, taskResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          taskResults[0].files.forEach(function (obj, i, arr) {
            if(obj._id == req.body.file_id){
              obj.collectors.push({
                userId: req.session.user.userId
              })
            }
          })
          taskResults[0].markModified('files');
          taskResults[0].save(function (err, saveResult) {
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
      })
    }
  }, function (err, finalReults) {
    if(err){
      res.send({
        success: false
      })
      return console.error(err)
    }else{
      if(finalReults.updateUser.success && finalReults.updateTask.success){
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

router.post('/task/file/cancel', function (req, res) {
  async.auto({
    updateUser: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null, {
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          var TaskFileCollections = userResults[0].TaskFileCollections;
          for(var i =0; i< TaskFileCollections.length; i++){
            if(TaskFileCollections[i].file_id == req.body.file_id){
              break;
            }
          }
          if(i < TaskFileCollections.length){
            userResults[0].TaskFileCollections.splice(i,1);
            userResults[0].markModified('TaskFileCollections');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null, {
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
          }else{
            callback(null)
          }
        }
      })
    },
    updateTask: function (callback) {
      task.find({taskId: req.body.taskId}, function (err, taskResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          for(var j = 0; j< taskResults[0].files.length; j++){
            if(taskResults[0].files[j]._id == req.body.file_id){
              console.log('j',j)
              break;
            }
          }
          if(j < taskResults[0].files.length){
            for(var m = 0; m< taskResults[0].files[j].collectors.length; m++){
              if(taskResults[0].files[j].collectors[m].userId == req.session.user.userId){
                break;
              }
            }
            if(m< taskResults[0].files[j].collectors.length ){
              taskResults[0].files[j].collectors.splice(m, 1);
              taskResults[0].markModified('files');
              taskResults[0].save(function (err, saveResults) {
                if(err){
                  callback(null, {
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
    console.log('finalResults', finalResults)
    if(err){
      res.send({
        success: false
      })
      return console.error(err)
    }else{
      if(finalResults.updateUser.success && finalResults.updateTask.success){
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
module.exports = router;