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
var _ = require("lodash");



//创建团队页面
router.get('/new/team',   function (req, res) {
  res.render('newteam')
});


//team保存到teams集合成功后：
//将该team的id存到当前用户文档的teams数组中，并且修改其中tag为true的数组元素
//创建团队
// TODO 改
router.post('/new/team',  function (req, res) {
  async.auto({
    teamCount: function (callback) {
      team.count(function(err, count){
        if(err){
          callback(null,{
            success: false,
            errMsg: 'count err'
          })
          return console.error(err)
        }else{
          callback(null,{
            success: true,
            count: count
          })
        }
      })
    },
    saveTeam: ['teamCount',function(results, callback){
      if(results.teamCount.success){
        var teamObj = new team({
          name: req.body.newteam.name,
          owner:req.session.user.userId,
          teamId:results.teamCount.count+1,
          manager: {
            id: req.session.user.userId,
            //name: req.session.user.nickName
          },
          members:[{
            id: req.session.user.userId,
            //name: req.session.user.nickName
          }]
        });
        teamObj.save(function (err, saveResult) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'save err'
            })
            return console.error(err)
          }else{
            callback(null,{
              success: true,
              newTeam: saveResult
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMSg: 'last step err'
        })
      }
    }],
    setSession: ['teamCount','saveTeam', function (results, callback) {
      if(results.saveTeam.success){
        req.session.team = {
          teamId: results.saveTeam.newTeam.teamId,
          teamName: results.saveTeam.newTeam.name
        };
        callback(null,{
          success: true
        })
      }else{
        callback(null,{
          success: false
        })
      }
    }],
    updateUser: ['saveTeam', function (results, callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find user errr'
          });
          return console.error(err)
        }else{
          if(userResults[0].teams.length>0){
            userResults[0].teams.forEach(function (obj, i, arr) {
              obj.tag = false
            })
            userResults[0].teams.push({
              teamId: req.session.team.teamId
            })
          }else{
            userResults[0].teams.push({
              teamId: req.session.team.teamId
            })
          }
          userResults[0].markModified('teams');
          userResults[0].save(function (err, saveResult) {
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
      });
    }]
  }, function (err, finalResults) {
    if(err){
      res.render('404page')
    }else{
      if(finalResults.setSession.success){
        res.redirect('/liao');
      }else{
        res.render('404page')
      }
    }
  });
});


//搜索团队
router.post('/search/team', function (req, res) {
  var teamName = req.body.teamName;
  async.auto({
    getTeams: function (callback) {
      team.find({name: teamName}, function (err, teamResults) {
        console.log('teamResults', teamResults)
        if(err){return console.error(err)}
        callback(null,teamResults)
      })
    },
    getTeamsOwner:['getTeams', function (results, callback) {
      async.map(results.getTeams, function (item, cb) {
        user.find({userId: item.manager.id}, function (err, userResults) {
          if(err){
            cb(null,'find err')
          }else{
            item.manager.name = userResults[0].nickName;
            cb(null, item)
          }
        })
      }, function (err, mapResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'map err'
          })
        }else{
          console.log('map', mapResults)
          callback(null,mapResults)
        }
      })
    }],
    getApplyTeams: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, results) {
        if(err){console.error(err)}
        callback(null,results[0].applyTeams)
      })
    },
    checkTeams: ['getTeamsOwner', function (results, callback) {
      //teams是一个数组，每个项是一个对象
      var teams = results.getTeamsOwner;
      var finalTeams = [];
      //item就是每一个数组
      //console.log('results', results);
      teams.forEach(function (obj, i, arr) {
        console.log('obj', obj)
        var newitem = {
          name: obj.name,
          createAt: obj.createAt,
          manager: obj.manager.name,
          teamId: obj.teamId
        };
        //console.log('length', obj.members.length)
        for(var j = 0 ;j < obj.members.length; j++){
          if(req.session.user.userId == obj.members[j].id){
            newitem.meng = 'true';
            //console.log('hahahha',newitem.meng,newitem)
            break
          }
        }
        finalTeams.push(newitem);

      });
      //console.log('finalTeams', finalTeams)
      callback(null, finalTeams)
    }]
  }, function (err, finalResults) {
    //console.log('finalrResults' ,finalResults)
    res.send({
      success: true,
      teams: finalResults.checkTeams,
      applyTeams: finalResults.getApplyTeams
    })
  });
});

router.get('/join/team', function (req, res) {
  res.render('join-team')
});

//申请加入某个团队（id），发送（存储）消息
//根据id去搜索这个团队的manager
//更新其notifications
router.post('/apply/team', function (req, res) {
  console.log('req body', req.body)
  var teamId = req.body.id;
  var applyId = req.body.userId;
  async.auto({
    getTeamName:  function (callback) {
        team.find({teamId: teamId}, function (err, teamResults) {
          if(err){
            return console.error(err)
          }
          callback(null,teamResults[0].name)
        })


    },
    getManagerId: function (callback) {
        team.find({teamId: teamId}, function (err, teamResults) {
          if(err){
            return console.error(err)
          }
          callback(null,teamResults[0].manager.id)
        })
    },
    updateApplyTeams: function (callback) {
      //更新申请者的申请加入team列表
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        console.log('find user', userResults)
        if(err){return console.error(err)}
        userResults[0].applyTeams.push(teamId);
        userResults[0].markModified('applyTeams');
        userResults[0].save(function (err) {
          if(err){console.error(err)}
        });
        callback(null)
      })
    },
    getNotiNum:['getManagerId', function (results, callback) {
        user.find({userId: results.getManagerId}, function(err, userResults){
          if(err){
            return console.error(err)
          }
          callback(null, userResults[0].notification.length)
        })

    }],
    updateNotification : [ 'getTeamName', 'getManagerId', 'getNotiNum', function (results, callback) {
        var userId = results.getManagerId;
        var success;
        console.log('userId', userId);
        user.update({userId: userId}, {$push:{"notification":{id: results.getNotiNum+1,msg_type: 1, team: {id: teamId,name: results.getTeamName}, from:{id:req.session.user.userId}}}}, function (msg) {
          if(msg == null){
            success = true
          }else{
            console.log('send failed!')
            res.back();
            success = false
          }
          callback(null, success)
        });

    }]
  }, function ( err,finalResults) {
    //console.log('mengmengmeng', finalResults)
    if(finalResults.updateNotification == true){
      res.send({
        success:true,
        from: req.session.user.userId,
        touser:finalResults.getManagerId
      });
      //})
    }
  });
  console.log('apply',teamId);

});


//获取该团队下面的所有成员
//对成员进行分类，分为在此话题中的和不在此话题中的两类
router.post('/members/team', function (req, res) {
  //console.log('req body', req.body);
  async.auto({
    getMembersArr: function (callback) {
      team.find({teamId: req.session.team.teamId}, function (err, teamResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
          return console.error(err)
        }else{
          callback(null, teamResults[0].members);
        }
      })
    },
    getTeamMembers: ['getMembersArr', function (results, callback) {
      //console.log('getMembersArr', results.getMembersArr)
      var members=[];
      async.map(results.getMembersArr, function (item, cb) {
        user.find({userId: item.id}, function(err, userResults){
          if(err){return cb('my err')}
          cb(null, {
            userId: userResults[0].userId,
            name: userResults[0].nickName,
            avatar: userResults[0].avatar
          })
        })
      }, function (err, results) {
        callback(null,results)
      })
    }],
    getTopicMembers: function (callback) {
      if(req.body.topic == "true"){
        topic.find({topicId: req.body.topicId}, function (err, topicResults) {
          //console.log('getTopicMembers',topicResults )
          if(err){
            callback(null,'err');
            return console.error(err)
          }
          callback(null,topicResults[0].members)
        })
      }else{
        callback(null)
      }

    }
  }, function (err, finalResults) {
    console.log('finalResults', finalResults)
    if(req.body.topic == "true"){
      res.send({
        success:true,
        teamMembers: finalResults.getTeamMembers,
        topicMembers: finalResults.getTopicMembers
      })
    }
    if(req.body.task == "true"){
      res.send({
        success:true,
        teamMembers: finalResults.getTeamMembers
      })
    }
  })

});
//后台修改团队基本信息
router.post('/admin/edit/team', function(req, res){
  async.auto({
    getManager: function (callback) {
      user.find({nickName: req.body.manager}, function (err, userResults) {
        //console.log('user', userResults)
        if(err){
          callback(null,{
            success: false,
            errMsg: '数据库查找错误'
          })
        }else{
          if(userResults.length == 1){
            //用户存在，那么还要去检查是不是这个团队的成员，如果是，就直接修改team，如果不是，不仅要修改team，还要修改user中的teams字段
            team.find({teamId: req.body.teamId}, function (err, teamResults) {
              console.log('team', teamResults)
              if(err){
                callback(null,{
                  success: false,
                  errMsg: "数据库查找错误"
                })
              }else{
                for(var i = 0; i < teamResults[0].members.length; i ++){
                  if(teamResults[0].members[i].id == userResults[0].userId){
                    break;
                  }
                }
                if(i == teamResults[0].members.length){
                  //也就是该用户并不是该团队的成员
                  callback(null,{
                    success: true,
                    exist: false,
                    userObj: userResults[0]
                  })
                }else{
                  callback(null,{
                    success: true,
                    exist: true,
                    userObj: userResults[0]
                  })
                }
              }
            })

          }else{
            callback(null,{
              success: false,
              errMsg: '该用户不存在'
            })
          }
        }
      })
    },
    updateTeam:['getManager',function (results,callback) {
      team.find({teamId: req.body.teamId}, function (err, teamResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: '数据库查找错误'
          })
        }else{
          teamResults[0].name = req.body.name;
          if(results.getManager.success){
            //有这个用户,那么要分两种情况,在团队中和不在团队中
            if(results.getManager.exist){
              //在团队中，直接改
              teamResults[0].manager.id = results.getManager.userObj.userId
            }else{
              //不在团队中
              teamResults[0].manager.id = results.getManager.userObj.userId
              results.getManager.userObj.teams.push({
                teamId: req.body.teamId
              });
              results.getManager.userObj.markModified('teams');
              results.getManager.userObj.save(function(err, userSaveResult){
                if(err){
                  console.error(err)
                }
              })
            }
            teamResults[0].markModified('name');
            teamResults[0].markModified('manager');
            teamResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: '数据库保存错误'
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
              errMsg: results.getManager.errMsg
            })
          }

        }
      })
    } ]
  }, function (err, finalResults) {
    console.log('final', finalResults.updateTeam.errMsg)
    if(err){
      res.send({
        success: false,
        errMsg: '更新失败'
      })
    }else{
      if(finalResults.updateTeam.success){
        res.send({
          success: true
        })
      }else{
        res.send({
          success: false,
          errMsg: finalResults.updateTeam.errMsg
        })
      }
    }
  })
});

//后台查看某个具体的团队信息
router.get('/admin/team', function (req, res) {
  async.auto({
    getTeam: function(callback){
      team.find({teamId: req.query.teamId}, function (err, teamResults) {
        if(err){
          callback(null,{
            success: false,
            errMsg: '数据库查找错误'
          })
        }else{
          callback(null,{
            success: true,
            teamObj: teamResults[0]
          })
        }
      })
    },
    getTopics:['getTeam', function (results, callback) {
      if(results.getTeam.success){
        async.map(results.getTeam.teamObj.topics, function (item, cb) {
          topic.find({topicId: item}, function (err, topicResults) {
            if(err){
              cb(null,'find err')
            }else{
              var topics = {};
              user.find({userId: topicResults[0].owner.id}, function (err, userResults) {
                if(err){
                  console.error(err)
                  cb(null)
                }else{
                  topics = {
                    topic: topicResults[0],
                    owner: userResults[0]
                  }
                  cb(null,topics)
                }
              })
            }
          })
        }, function (err, mapResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: '出错了',
              topics:[]
            })
          }else{
            callback(null, {
              success: true,
              topics: _.compact(mapResults)
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.getTeam.errMsg,
          topics:[]
        })
      }
    }],
    getMembers: ['getTeam', function(results, callback){
      if(results.getTeam.success){
        async.map(results.getTeam.teamObj.members, function (item, cb) {
          user.find({userId: item.id}, function (err, userResults) {
            if(err){
              cb(null,'find err')
            }else{
              cb(null,userResults[0])
            }
          })
        }, function (err, mapResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: '出错了',
              members: []
            })
          }else{
            callback(null,{
              success: true,
              members: mapResults
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.getTeam.errMsg,
          members:[]
        })
      }

    }],
    getTasks: ['getTeam', function (results, callback) {
      console.log('task result', results.getTeam)
      if(results.getTeam.success){
        async.map(results.getTeam.teamObj.tasks, function (item, cb) {
          task.find({taskId: item}, function (err, taskResults) {
            console.log('task',taskResults)
            if(err){
              cb(null,'find err')
            }else{
              var taskObj = {};
              user.find({userId: taskResults[0].owner.id}, function (err, userResults) {
                if(err){
                  console.error(err)
                  cb(null)
                }else{
                  taskObj = {
                    task: taskResults[0],
                    owner: userResults[0]
                  }
                  cb(null, taskObj)
                }
              })
            }
          })
        }, function (err, mapResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: '出错啦',
              tasks: []
            })
          }else{
            callback(null,{
              success: true,
              tasks: _.compact(mapResults)
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.getTeam.errMsg,
          tasks:[]
        })
      }
    }],

  }, function (err, finalResults) {
    console.log('ff', finalResults.getTasks)
    res.render('back-team',{
      team: finalResults.getTeam.teamObj,
      topics: finalResults.getTopics.topics,
      members: finalResults.getMembers.members,
      tasks: finalResults.getTasks.tasks

    })
  })
});
module.exports = router;