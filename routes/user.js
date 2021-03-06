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
var _ = require("lodash");
var captchapng = require('captchapng');

router.get('/invest', function (req, res) {
  res.render('invested',{
    teamId: req.query.teamId,
    topicId: req.query.topicId,
    tag: req.query.tag
  })
});

router.get('/signup', function (req, res) {
  res.render('signup')
});
router.post('/signup', function (req, res) {
  async.auto({
    checkNickName: function (callback) {
      user.find({nickName: req.body.nickName}, function(err, userResults){
        if(err){
          callback(null,{
            success: false,
            errMsg: '请重试'
          })
        }else{
          if(userResults.length > 0){
            callback(null,{
              success: false,
              errMsg: '用户名已存在'
            })
          }else{
            callback(null,{
              success: true
            })
          }
        }
      })
    },
    signUp:['checkNickName', function (results, callback) {
      if(results.checkNickName.success){
        user.count(function (err, count) {
          var userObj = new user({
            nickName: req.body.nickName,
            password: req.body.password,
            userId: count+1
          })
          userObj.save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: false,
                errMsg: '保存失败'
              })
            }else{
              console.log('newUser', saveResult)
             callback(null,{
               success: true,
               userObj: saveResult
             })
            }
          })
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.checkNickName.errMsg
        })
      }
    }],
    checkInvest: ['signUp', function(results, callback){
      if(results.signUp.success){
        if(req.body.invest == 'true'){
          var userObj = results.signUp.userObj;
          userObj.teams.push({
            teamId: req.body.teamId
          });
          if(req.body.tag == 1){
            userObj.topics.push({
              topicId: req.body.topicId
            });
            userObj.markModified('topics');
          }
          userObj.markModified('teams');
          userObj.save(function(err, saveResult){
            console.log('err')
            if(err){
              callback(null,{
                success: false,
                errMsg:'保存失败'
              })
            }else{
              callback(null,{
                success: true,
                invest: true,
                userObj: saveResult
              })
            }
          })
        }else{
          console.log('without invest true')
          callback(null,{
            success: true,
            invest:false,
            userObj: results.signUp.userObj
          })
        }
      }else{
        console.log('without invest true')

        callback(null,{
          success: false,
          errMsg: results.signUp.errMsg
        })
      }
    }],
    getTeamName: function (callback) {
      console.log('req.body',req.body);
      if(req.body.invest == 'true'){
        team.find({teamId: req.body.teamId}, function (err, teamResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'getTeamName find err'
            })
          }else{
            callback(null,{
              success: true,
              teamName: teamResults[0].name
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: 'normal signup user'
        })
      }
    },
    setSession: ['checkInvest', 'getTeamName', function (results, callback) {
      //console.log('setSession', results.checkInvest);
      if(results.checkInvest.success){
        console.log('set user session')
        req.session.user = {
          userId: results.checkInvest.userObj.userId,
          nickName: results.checkInvest.userObj.nickName,
          avatar: results.checkInvest.userObj.avatar
        };
        if(results.checkInvest.invest){
          //说明是被邀请的注册用户,那么session里面要存team
          if(results.getTeamName.success){
            console.log('set team session')
            req.session.team = {
              teamId: req.body.teamId,
              teamName: results.getTeamName.teamName
            };
            callback(null,{
              success: true
            })
          }else{
            callback(null,{
              success: false,
              errMsg: results.getTeamName.errMsg
            })
          }
        }else{
          callback(null,{
            success: true
          })
        }
      }else{
        callback(null,{
          success: false,
          errMsg: results.checkInvest.errMsg
        })
      }
    }],
    addToTeams: ['signUp', function (results, callback) {
      if(results.signUp.success){
        if(req.body.invest == 'true'){
          team.find({teamId: req.body.teamId}, function (err, teamResults) {
            if(err){
              callback(null,{
                success: false,
                errMsg: 'find err'
              })
            }else{
              teamResults[0].members.push({
                id: results.signUp.userObj.userId,
                name: results.signUp.userObj.nickName
              });
              teamResults[0].markModified('members');
              teamResults[0].save(function (err, saveResults) {
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
        }else{
          callback(null)
        }
      }else{
        callback(null,{
          success: false,
          errMsg: results.signUp.errMsg
        })
      }


    }],
    addToTopic: ['signUp', function(results, callback){
      if(results.signUp.success){
        if(req.body.tag == 1){
          console.log('req body',req.body)
          topic.find({topicId: req.body.topicId}, function (err, topicResults) {
            if(err){
              callback(null,{
                success: false,
                errMsg: 'find err'
              });
              return console.error(err)
            }else{
              console.log('topic', topicResults[0])
              topicResults[0].members.push({
                userId: results.signUp.userObj.userId,
                name: results.signUp.userObj.nickName
              });
              topicResults[0].markModified('members');
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
          })
        }else{
          callback(null)
        }
      }else{
        callback(null,{
          success:false,
          errMsg: results.signUp.errMsg
        })
      }

    }]
  }, function (err, finalResults) {
    //console.log('finalResults', finalResults)
    if(err){
      res.render('404Page')
    }else{
      if(finalResults.checkNickName.success){
        if(finalResults.setSession.success){
          res.send({
            success: true,
            userId:finalResults.signUp.userObj.userId
          })
        }else{
          //req.flash('loginName',finalResults.checkNickName.errMsg)
          res.send({
            success: false,
            errMsg: '注册失败'
          })
        }

      }else{
        //req.flash('loginName',finalResults.checkNickName.errMsg)
        res.send({
          success: false,
          errMsg:finalResults.checkNickName.errMsg
        })
      }
    }
  })
});

//新注册用户完善个人信息
router.get('/complete', function(req, res){
  res.render('complete-msg')
});
router.post('/complete', function (req, res) {
  user.find({userId: req.session.user.userId}, function (err, userResults) {
    if(err){
      res.send({
        success: false,
        errMsg:"出错！"
      })
    }else{
      userResults[0].realName.name = req.body.realName;
      userResults[0].markModified('realName');
      if(req.body.phoneNumber !== ""){
        userResults[0].phoneNumber = req.body.phoneNumber;
        userResults[0].markModified('phoneNumber');
      }
      if(req.body.email !== ""){
        userResults[0].email = req.body.email;
        userResults[0].markModified('email');
      }
      if(req.body.wechat !== ""){
        userResults[0].wechat = req.body.wechat;
        userResults[0].markModified('wechat');
      }
      if(req.body.department !== ""){
        userResults[0].department = req.body.department;
        userResults[0].markModified('department');
      }
      if(req.body.job !== ""){
        userResults[0].job = req.body.job;
        userResults[0].markModified('job');
      }
      userResults[0].save(function (err, saveResult) {
        if(err){
          res.send({
            success: false,
            errMsg: '保存失败'
          })
        }else{
          res.send({
            success: true
          })
        }
      })
    }
  })
})


//登录
router.get('/login', function (req, res) {
  console.log('login')
  res.render('login')
});

//登录
//设置session中的user和team（tag为true）
router.post('/login', function (req, res) {
  var userObj = {
    nickName: req.body.nickName,
    password: req.body.password
  };

  user.find({nickName:userObj.nickName}, function (err, results) {
    //console.log('user,', results);
    if(err){
      return console.error(err);
    }
    if(results.length <= 0){
      req.flash('loginName','该用户不存在');
      return res.send({
        success: false,
        falseType: 2
      });
    }

    if(results[0].password === userObj.password){
      req.session.user = {
        userId: results[0].userId,
        nickName: results[0].nickName,
        avatar: results[0].avatar
      };
      if(req.body.nickName == "admin_"){
        //管理员登陆
        return res.send({
          success: true,
          userType: '0'
        })
      }else{
        //普通用户登陆
        if(results[0].teams.length == 0){
          return res.send({
            success:false,
            falseType: 1,
            userId: results[0].userId
          })
        }
        async.auto({
          getTeamId: function (callback) {
            var f_user;
            user.find({userId: results[0].userId}, function (err,UserResults) {
              UserResults[0].teams.forEach(function (obj, i, arr) {
                if(obj.tag == true){
                  callback(null, obj.teamId)
                }
              });
            })
          },
          getTeamName:['getTeamId', function (UserResults, callback) {
            console.log('results', UserResults.getTeamId);
            team.find({teamId: UserResults.getTeamId}, function (err, teamResults) {
              callback(null, teamResults[0].name)
            })
          }]
        }, function (err, finalResults){

          //console.log('finalResults', finalResults)
          req.session.team = {
            teamName: finalResults.getTeamName,
            teamId: finalResults.getTeamId
          };
          res.send({
            success:true,
            userType: '1',
            userId: results[0].userId
          });
        });
      }
    }else{
      req.flash('error','密码不正确');
      return res.send({
        success: false,
        falseType: 3
      })
    }
  })
});




//新用户
router.get('/new',  function (req, res) {
  res.render('new')
});


//消息中心
router.get('/message/all', function (req, res) {
  var userId = req.session.user.userId;
  async.auto({
    getNotificationArr: function(callback){
      user.find({userId: userId}, function(err,userResults){
        if(err){
          return console.error(err)
        }
        callback(null, userResults[0].notification)
      })
    },
    updateNotiTag: function (callback) {
      user.find({userId: userId}, function (err, userResults) {
        if(err){
          callback(null,'err')
        }else{
          userResults[0].notification.forEach(function (obj, i, arr) {
            if(obj.read_tag == false ){
              obj.read_tag = true;
            }
          });
          userResults[0].markModified('notification');
          userResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,'save err');
              return console.error(err)
            }else{
              callback(null,'update success')
            }
          })
        }
      })
    },
    classify:['getNotificationArr', function (notiResults, callback) {
      //console.log('notifications', notifications);
      var notifications = notiResults.getNotificationArr;
      var allNoti = {};
      var unreadNoti = [];
      var readNoti = [];
      var unhandle = [];
      notifications.forEach(function (obj, i, arr) {
        if(obj.deal_tag == false){
          unhandle.push(obj)
        }
        if(obj.read_tag == true){
          readNoti.push(obj)
        }else{
          unreadNoti.push(obj)
        }
      });
      allNoti = {
        unreadNoti: unreadNoti,
        readNoti: readNoti,
        unhandle: unhandle
      };
      callback(null,allNoti)
    }],
    getNotiFromUserMsg: ['getNotificationArr', function (results, callback) {
      var notifications = results.getNotificationArr;
      async.map(notifications, function (item, cb) {
        if(item.msg_type == 7 || item.msg_type == 5 || item.msg_type == 4 || item.msg_type == 6|| item.msg_type == 1 || item.msg_type == 9 || item.msg_type == 10 || item.msg_type == 11){
          user.find({userId: item.from.id}, function (err, userResults) {
            //console.log('userresut', userResults)
            if(err){
              cb(null, 'find err')
            }else{
              item.from.name = userResults[0].nickName;
              item.from.avatar = userResults[0].avatar;
              cb(null, item)
            }
          })
        }
        if(item.msg_type == 8){
          async.map(item.task.users, function (uitem, ucb) {
            user.find({userId: uitem.id}, function (err, userResults) {
              if(err){
                ucb(null,'find err')
              }else{
                uitem.name = userResults[0].nickName;
                uitem.avatar = userResults[0].avatar;
                ucb(null, uitem)
              }
            })
          });
          cb(null, item)
        }
      }, function (err, mapResults) {
        if(err){
          callback(null, 'map err')
        }else{
          callback(null)
        }
      })
    }],
    getTeamMsg:['getNotificationArr', function (results, callback) {
      var notifications = results.getNotificationArr;
      async.map(notifications, function(item, cb){
        if(item.team.id){
          console.log('item',item)
          team.find({teamId: item.team.id}, function (err, teamResults) {
            if(err){
              cb(null,{
                success: false,
                errMsg: '数据库错误'
              })
            }else{
              item.team.name = teamResults[0].name;
              cb(null)
            }
          })
        }else{
          cb(null)
        }
      }, function (err, mapResults) {
        console.log('map',mapResults)
        if(err){
          callback(null,{
            success: false,
            errMsg:'数据库错误'
          })
        }else{
          callback(null)
        }
      })
    }]
  }, function (err, finalRes) {
    console.log('messagedddddddddd', finalRes)
    res.render('msgcenter',{
      notifications: finalRes.classify.unreadNoti,
      hisNotifications: finalRes.classify.readNoti,
      unhandleNoti: finalRes.classify.unhandle
    })
  });
});

//同意加入团队
router.post('/agree', function (req, res) {
  if(req.body.aType == 1){
    console.log(req.body)
    var teamId = req.body.teamId;
    var userId = req.session.user.userId;
    var notificationId = req.body.notificationId;
    var applyname = req.body.applyName;
    var requestId = req.body.requestId;
    var apply = {
      id: requestId,
      name: applyname
    };

    async.auto({
      updateTeamMembers:  function (callback) {
        console.log('updateTeamMember')
        team.find({teamId: teamId}, function (err, teamResults) {
          if(err){
            return console.error(err)
          }
          console.log('teamResults',teamResults[0])
          teamResults[0].members.push(apply);
          teamResults[0].markModified('members');
          teamResults[0].save(function (err) {
            if(err){
              return console.error(err)
            }
          })
        });
        return callback(null)
      },
      updateNotification: function (callback) {
        user.find({userId: userId}, function (err, userResults) {
          if(err){
            callback(null,"false");
            return console.error(err)
          }
          userResults[0].notification.forEach(function (item, i, arr) {
            if(item.id == notificationId){
              console.log('item', item)
              item.read_tag = true;
              item.deal_tag = true;
              userResults[0].markModified('read_tag');
              userResults[0].markModified('deal_tag');
              userResults[0].save(function (err) {
                if(err){
                  return console.error(err)
                }else{
                  return console.log('read this notification!')
                }
              })
            }
          });
          callback(null,"true")
        })
      },
      sendNotification: function (callback) {
        user.find({userId: requestId}, function (err, userResults) {
          if(err){
            console.error(err)
            callback(null,{
              success: false,
              errMsg:'数据库错误'
            })
          }else{
            userResults[0].notification.push({
              msg_type: 10,
              id: userResults[0].notification.length +1,
              from:{
                id: userId
              },
              team:{
                id: teamId
              }
            });
            userResults[0].markModified('notification');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: '数据库错误'
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
      updateApplyUser: ['updateNotification', function (results, callback) {
        if(results.updateNotification){
          user.find({userId: requestId}, function (err, userResults) {
            if(err){
              return console.error(err)
            }
            if(userResults[0].teams.length <= 0){
              userResults[0].teams.push({
                tag:true,
                teamId: teamId
              });
              userResults[0].markModified('teams');
              userResults[0].save(function (err) {
                if(err){
                  return console.error(err)
                }
              })
              callback(null)
            }else{
              userResults[0].teams.forEach(function (item, i, arr) {
                if(item.tag == true){
                  item.tag = false;
                  userResults[0].markModified('tag');
                  userResults[0].save(function (err) {
                    if(err){
                      return console.error(err)
                    }
                  })
                }
              });
              userResults[0].teams.push({
                tag:true,
                teamId: teamId
              });
              userResults[0].markModified('teams');
              userResults[0].save(function (err) {
                if(err){
                  return console.error(err)
                }
              })
              callback(null)
            }
          })
        }
      }]
    }, function (err, finalRes) {
      res.send({
        success: true
      })
    })

  }
});


//拒绝加入团队
router.post("/disagree/team", function(req, res){
  var teamId = req.body.teamId;
  var userId = req.session.user.userId;
  var notificationId = req.body.notificationId;
  var requestId = req.body.requestId;
  async.auto({
    updateHostNoti: function (callback) {
      user.find({userId: userId}, function (err, userResults) {
        if(err){
          console.error(err)
          callback(null,{
            success: false,
            errMsg:'数据库错误'
          })
        }else{
          for(var i = 0; i< userResults[0].notification.length; i++){
            if(userResults[0].notification[i].id == notificationId){
              userResults[0].notification[i].read_tag = true;
              userResults[0].notification[i].deal_tag = true;
              userResults[0].markModified('read_tag');
              userResults[0].markModified('deal_tag');
              userResults[0].save(function (err, saveResult) {
                if(err){
                  console.error(err)
                }
              })
              break;
            }
          }
          callback(null,{
            success: true
          })
        }
      })
    },
    sendNotification: function(callback){
      user.find({userId: requestId}, function(err, userResults){
        if(err){
          callback(null,{
            success: false,
            errMsg:'数据库错误'
          })
        }else{
          userResults[0].notification.push({
            msg_type: 11,
            id: userResults[0].notification.length +1,
            from:{
              id: userId
            },
            team:{
              id: teamId
            }
          })
          userResults[0].markModified('notification');
          userResults[0].save(function (err, saveResult) {
            if(err){
              callback(null,{
                success: false,
                errMsg:'数据库错误'
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
      console.error(err)
      res.send({
        success: false
      })
    }else{
      if(finalResults.sendNotification.success){
        res.send({
          success: true
        })
      }
    }
  })
})
router.get('/logout', function (req, res) {
  delete req.session.user;
  delete req.session.team;
  return res.render('login')
});

//邀请某个成员加入某个话题
//也就是将userId和userName加入topic的members数组
//给该用户发通知
//更改该用户的topics
router.post('/invest/member', function (req, res) {
  var userId = req.body.userId;
  var topicId = req.body.topicId;

  async.auto({
    getUserName: function(callback){
      user.find({userId: userId}, function (err, userResults) {
        if(err){return console.error(err)}
        callback(null,userResults[0])
      })
    },
    getTopicMsg: function (callback) {
      topic.find({topicId: topicId}, function (err, topicResults) {
        if(err){
          callback(null,'false');
        }
        callback(null, topicResults[0])
      })
    },
    updateTopic: ['getUserName', function (results, callback) {
      topic.find({topicId: topicId}, function (err, topicResults) {
        if(err){return console.error(err)}
        topicResults[0].members.push({
          userId: userId,
          name: results.getUserName.nickName
        });
        topicResults[0].markModified('members');
        topicResults[0].save(function (err, results) {
          if(err){
            callback(null,'false');
            return console.error(err)}
          callback(null,'true')
        })
      })
    }],
    updateUser: ['getTopicMsg',function (results,callback) {
      console.log('getTopicMsg',results)
      user.find({userId: userId}, function (err, userResults) {
        if(err){
          callback(null,'false');
          return console.error(err)
        }
        userResults[0].topics.push({
          topicId: topicId
        });
        userResults[0].markModified('topics');
        userResults[0].notification.push({
          from:{
            id: results.getTopicMsg.owner.id,
            //name: results.getTopicMsg.owner.name
          },
          msg_type:5,
          id: userResults[0].notification.length + 1,
          topic:{
            id: results.getTopicMsg.topicId,
            title: results.getTopicMsg.title
          }
        });
        userResults[0].markModified('notification');
        userResults[0].save(function(err, result){
          if(err){
            return callback(null,'false')
          }
          callback(null,'true');
        })
      })
    }]
  }, function (err, finalResults) {
    if(err){
      res.send({
        success: false
      });
      return console.error(err)
    }
    res.send({
      success:true,
      user: finalResults.getUserName
    })
  })

});

router.get('/all/team', function (req, res) {
  async.auto({
    getTeamsArr: function(callback){
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }
        callback(null, userResults[0].teams)
      })
    },
    getTeam:['getTeamsArr', function (results, callback) {
      var teams = results.getTeamsArr;
      async.map(teams, function (item, cb) {
        team.find({teamId: item.teamId}, function (err, teamResults) {
          if(err){
            cb(null,'find err')
          }
          cb(null, teamResults[0])
        })
      }, function (err, mapResults) {
        console.log('mapResults',mapResults);
        if(err){
          callback(null,'err');
          return console.error(err)
        }
        callback(null, mapResults)
      })
    }]
  }, function (err, finalResults) {
    if(err){
      return res.send({
        success: false
      })
    }else{
      res.send({
        success: true,
        teams: finalResults.getTeam
      })
    }

  })
});

router.get("/exchange/team", function (req, res) {
  console.log('hello exchange',req.query)
  console.log()
  async.auto({
    updateUser: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }
        userResults[0].teams.forEach(function (obj, i, arr) {
          if(obj.teamId == req.query.teamId){
            obj.tag=true
          }else{
            obj.tag=false
          }
        });

        userResults[0].markModified('teams');
        userResults[0].save(function (err, saveResult) {
          if(err){
            callback(null,'save err')
            return console.error(err)
          }else{
            callback(null)
          }
        })
      })
    },
    getTeam: function (callback) {
      team.find({teamId: req.query.teamId}, function (err, teamResults) {
        if(err){
          console.error(err)
          return callback(null,'find err');
        }
        console.log('wokao', teamResults[0])
        callback(null,teamResults[0])
      })
    },
    updateSession: ['updateUser','getTeam', function(results, callback){
      console.log('tddddd',results)
      req.session.team.teamId=req.query.teamId;
      req.session.team.teamName = results.getTeam.name;
      callback(null,req.session);
    }]
  }, function (err, finalResults) {
    //console.log('exchange', finalResults)
    //if(err){
    //  console.error(err)
    //  res.redirect('/liao')
    //}else{
    //  res.redirect('/liao');
    //}
    res.redirect('/liao');
    //res.send({
    //  success: true
    //})
  })
});

router.get('/setting/user', function (req, res) {
  user.find({userId: req.session.user.userId}, function (err, userResults) {
    if(err){
      res.render('404page');
    }else{
      res.render("usersetting",{
        user:userResults[0]
      });
    }

  })

});
router.post("/set/user", function (req, res) {
  async.auto({
    checkName: function (callback) {
      user.find({nickName: req.body.name}, function (err, userResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }
        if(userResults.length > 0){
          return callback(null,'name already existed')
        }else{
          callback(null,{
            success:'true'
          })
        }
      });
    },
    updateUser: ['checkName',function(results,callback){
      if(results.success == 'true'){
        user.find({userId: req.session.user.userId}, function (err, userResults) {
          console.log('userREsults',userResults[0])
          if(req.body.oldpsw !== userResults[0].password){
            callback(null,'password error')
            return
          }else{
            userResults[0].nickName = req.body.name;
            userResults[0].password = req.body.psw;
            userResults[0].markModified('nickName');
            userResults[0].markModified('password');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,'save err')
                return console.error(err)
              }
              callback(null,{
                success:'true',
                user:saveResult
              })
            })
          }
        })
      }else{
        callback(null,'err')
      }

    }],
    updateSession: ['updateUser', function (results, callback) {
      if(results.updateUser.success == 'true'){
        req.session.user.nickName = results.updateUser.user.nickName
        return callback(null,{
          success:'true'
        })
      }else{
        callback(null,{
          success: 'false'
        })
      }
    }]
  }, function (err, finalResults) {
    if(err){
      res.send({
        success:false
      })
    }else{
      if(finalResults.updateSession.success=='true'){
        res.send({
          success: true
        })
      }else{
        res.send({
          success:false,
          msg:'用户名已存在'
        })
      }
    }

  });
});

//统计
router.get('/statistics', function(req, res){
  async.auto({
    getTeam: function (callback) {
      team.find({teamId: req.session.team.teamId}, function (err, teamRestuls) {
        if(err){
          callback(null,'team find err')
          return console.error(err)
        }
        callback(null, teamRestuls[0])
      })
    },
    teamTopic: ['getTeam',function (results,callback) {
      var topic0=[];//未结束的话题
      var topic1=[];//已结束的话题
      var topic2=[];//逾期的话题
      async.map(results.getTeam.topics, function (item, cb) {
        topic.find({topicId: item}, function (merr, topicResults) {
          if(merr){
            cb(null,'err');
            return console.error(err)
          }else{
            if(topicResults[0].condition == 0){
              topic0.push(topicResults[0])
              cb(null)
            }else if(topicResults[0].condition == 1){
              topic1.push(topicResults[0])
              cb(null)
            }else{
              topic2.push(topicResults[0])
              cb(null)
            }
          }
        })
      }, function (err, mapResults) {
        if(err){
          callback(null);
          return console.error(err)
        }else{
          callback(null,{
            topic0: topic0,
            topic1: topic1,
            topic2: topic2
          });
        }
      })
    }],
    teamTask: ['getTeam',function(results,callback){
      var task0=[];
      var task1=[];
      var task2=[];
      async.map(results.getTeam.tasks, function (item, cb) {
        task.find({taskId: item}, function (err, taskResults) {
          if(err){
            cb(null,'err')
            return console.error(err)
          }else{
            if(taskResults[0].condition==0){
              task0.push(taskResults[0])
              cb(null)
            }else if(taskResults[0].condition==1){
              task1.push(taskResults[0]);
              cb(null)
            }else{
              task2.push(taskResults[0]);
              cb(null)
            }
          }
        })
      }, function (err, mapResults) {
        if(err){
          callback(null);
          return console.error(err)
        }else{
          callback(null,{
            task0: task0,
            task1: task1,
            task2: task2
          })
        }
      })
    }],
    userTopic: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,'find err');
          return console.error(err)
        }else{
          var topics = userResults[0].topics;
          console.log('topics ', topics)

          var utopics0 = [];
          var utopics1 = [];
          var utopics2 = [];
          if(topics.length <1){
            return callback(null,{
              utopic0: utopics0,
              utopic1: utopics1,
              utopic2: utopics2
            })
          }
          async.map(topics, function (item, cb) {
            console.log('item,', item)
            topic.find({topicId: item.topicId}, function (err, topicResults) {
              if(err){
                cb(null,'find err')
                return console.error(err)
              }else{
                console.log('topicResults', topicResults[0])
                console.log('topic teamId', topicResults[0].teamId)
                console.log('session teamId', req.session.team.teamId)
                if(topicResults[0].teamId == req.session.team.teamId){
                  if(topicResults[0].condition == 0){
                    utopics0.push(topicResults[0])
                  }else if(topicResults[0].condition == 1){
                    utopics1.push(topicResults[0])
                  }else{
                    utopics2.push(topicResults[0])
                  }
                  cb(null)
                }else{
                  cb(null)
                }
              }
            })
          }, function (err, mapResults) {
            console.log('map', utopics0)
            if(err){
              callback(null, 'map err')
              return console.error(err)
            }else {
              callback(null,{
                utopic0: utopics0,
                utopic1: utopics1,
                utopic2: utopics2
              })
            }
          })
        }
      })
    },
    userTask: function(callback){
      user.find({userId: req.session.user.userId}, function (err, userResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }else{
          var hostTask = userResults[0].tasks;
          var performerTask = userResults[0].taskArr;
          var hostTaskSum = hostTask.length;
          var performerTaskSum = 0;
          var performerTask0 = [];
          var performerTask1 = [];
          var performerTask2 = [];

          async.map(performerTask, function (item, cb) {
            performerTaskSum = item.taskItems.length + performerTaskSum;
            item.taskItems.forEach(function (obj, i, arr) {
              if(obj.condition == 0){
                performerTask0.push(obj);
              }else if(obj.condition == 1){
                performerTask1.push(obj)
              }else{
                performerTask2.push(obj)
              }
            });
            cb(null)
          }, function (err, mapResults) {
            if(err){
              console.error(err);
              callback(null,'map err')
            }else{
              callback(null,{
                performerTaskSum: performerTaskSum,
                performerTask0: performerTask0,
                performerTask1: performerTask1,
                performerTask2: performerTask2,
                hostTask :hostTask,
                hostTaskSum: hostTaskSum
              })
            }
          })
        }
      })
    },
    getTeam: function (callback) {
      team.find({teamId: req.session.team.teamId}, function (err, teamResults) {
        if(err){
          callback(null, 'find err')
        }else{
          callback(null, teamResults[0])
        }
      })
    },
    teamTopics:['getTeam', function (results,callback) {
      if(results.getTeam.owner == req.session.user.userId){
        var tTopicSum = results.getTeam.topics.length;
        var tTaskSum = results.getTeam.tasks.length;
        callback(null,{
          team:true,
          tTopicSum: tTopicSum,
          tTaskSum: tTaskSum
        })
      }else{
        callback(null,{
          team: false
        })
      }
    }]
  }, function (err, finalResults) {
    if(err){

    }else{
      if(finalResults.teamTopics.team){
        //是团队的owner
        res.render('statistics',{
          utopic0: finalResults.userTopic.utopic0,
          utopic1: finalResults.userTopic.utopic1,
          utopic2: finalResults.userTopic.utopic2,
          uHostTask: finalResults.userTask.hostTask,
          uHostTaskSum: finalResults.userTask.hostTaskSum,
          uPerformerTask0: finalResults.userTask.performerTask0,
          uPerformerTask1: finalResults.userTask.performerTask1,
          uPerformerTask2: finalResults.userTask.performerTask2,
          uPerformerTaskSum: finalResults.userTask.performerTaskSum,
          tTopicSum: finalResults.teamTopics.tTopicSum,
          tTaskSum: finalResults.teamTopics.tTaskSum,
          teamOwner: true,
          topic0: finalResults.teamTopic.topic0,
          topic1: finalResults.teamTopic.topic1,
          topic2: finalResults.teamTopic.topic2,
          task0: finalResults.teamTask.task0,
          task1: finalResults.teamTask.task1,
          task2: finalResults.teamTask.task2
        })
      }else{
        //只是员工
        res.render('statistics',{
          utopic0: finalResults.userTopic.utopic0,
          utopic1: finalResults.userTopic.utopic1,
          utopic2: finalResults.userTopic.utopic2,
          uHostTask: finalResults.userTask.hostTask,
          uHostTaskSum: finalResults.userTask.hostTaskSum,
          uPerformerTask0: finalResults.userTask.performerTask0,
          uPerformerTask1: finalResults.userTask.performerTask1,
          uPerformerTask2: finalResults.userTask.performerTask2,
          uPerformerTaskSum: finalResults.userTask.performerTaskSum,
          teamOwner: false,
          topic0: finalResults.teamTopic.topic0,
          topic1: finalResults.teamTopic.topic1,
          topic2: finalResults.teamTopic.topic2,
          task0: finalResults.teamTask.task0,
          task1: finalResults.teamTask.task1,
          task2: finalResults.teamTask.task2
        })
      }

    }
  })
});


//changeType:
//0-改头像
//1-改用户名
//2-改密码
//3-改真实姓名
//4-改部门
//5-改职位
//6-改手机号码
//7-改邮箱地址
//8-改微信
router.post('/user/setting', function (req, res) {
  async.auto({
    updateAvatar: function (callback) {
      if(req.body.changeType == '0'){
        user.find({userId: req.body.userId}, function (err, userResults) {
          if(err){
            return callback(null,{
              success: false,
              errMsg: 'find err'
            })
          }else{
            userResults[0].avatar = req.body.src;
            userResults[0].markModified('avatar');
            userResults[0].save(function (err, saveResult) {
              if(err){
                return callback(null,{
                  success: false,
                  errMsg: 'save err'
                })
              }else{
                req.session.user.avatar = req.body.src;
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
    },
    vertificationNickName: function (callback) {
      if(req.body.changeType == '1'){
        user.find({nickName: req.body.nickName}, function(err, userResults){
          if(err){
            callback(null,{
              success: false,
              errType:'0',
              errMsg: 'find err'
            })
          }else{
            if(userResults.length > 0){
              callback(null,{
                success: false,
                errMsg:'existed',
                errType: '1'
              })
            }else{
              callback(null,{
                success: true
              })
            }
          }
        })
      }else{
        callback(null,{
          success: false
        })
      }
    },
    updateNickName: ['vertificationNickName',function (results, callback) {
      if(results.vertificationNickName.success){
        user.find({userId: req.body.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err'
            })
          }else{
            userResults[0].nickName = req.body.nickName;
            userResults[0].markModified('nickName');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: 'save err'
                })
              }else {
                req.session.user.nickName = req.body.nickName;
                callback(null,{
                  success: true
                })
              }
            })
          }
        })
      }else{
        callback(null,{
          success: false
        })
      }
    }],
    updateRealName: function (callback) {
      if(req.body.changeType == '3'){
        user.find({userId: req.body.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg:'find err',
              errType :'1'
            })
          }else{
            userResults[0].realName.name = req.body.realName;
            userResults[0].markModified('realName');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: 'save err',
                  errType: '2'
                })
              }else{
                callback(null,{
                  success: true
                })
              }
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errType: '0'
        })
      }

    },
    updatePassword: function (callback) {
      if(req.body.changeType == '2'){
        user.find({userId: req.body.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err',
              errType: '1'
            })
          }else{

            if(req.body.oldPsd !== userResults[0].password){
              callback(null,{
                success: false,
                errMsg:'原来的密码不正确，请重新输入',
                errType: '2'
              })
            }else{
              userResults[0].password = req.body.newPsd;
              userResults[0].markModified('password');
              userResults[0].save(function (err, saveResult) {
                if(err){
                  callback(null,{
                    success: false,
                    errMsg: 'save err',
                    errType: '3'
                  })
                }else{
                  callback(null,{
                    success: true
                  })
                }
              })
            }
          }
        })
      }else{
        callback(null,{
          success: false,
        })
      }

    },
    updateDepartment: function (callback) {
      if(req.body.changeType == '4'){
        user.find({userId: req.body.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err'
            })
          }else{
            userResults[0].department = req.body.department;
            userResults[0].markModified('department');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg:'save err'
                })
              }else{
                callback(null,{
                  success: true
                })
              }

            })
          }
        })
      }else{
        callback(null,{
          success: false
        })
      }
    },
    updateJobName: function (callback) {
      if(req.body.changeType == '5'){
        user.find({userId: req.session.user.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err'
            })
          }else{
            userResults[0].jobName = req.body.jobName;
            userResults[0].markModified('jobName');
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
      }else{
        callback(null,{
          success: false
        })
      }
    },
    updateWechat: function (callback) {
      if(req.body.changeType == '6'){
        user.find({userId: req.session.user.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err'
            })
          }else{
            userResults[0].wechat = req.body.wechat;
            userResults[0].markModified('wechat');
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
      }else{
        callback(null,{
          success: false
        })
      }
    },
    updatePhoneNumber: function(callback){
      if(req.body.changeType == '7'){
        user.find({userId: req.body.userId}, function (err, userResults) {
          console.log('user', userResults[0])
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err',
              errType: '1'
            })
          }else{
            userResults[0].phoneNumber = req.body.phoneNumber;
            userResults[0].markModified('phoneNumber');
            userResults[0].save(function (err, saveResults) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg:'save err',
                })
              }else{
                callback(null,{
                  success: true
                })
              }
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errType: '0'
        })
      }
    },
    updateEmail: function(callback){
      if(req.body.changeType == '8'){
        user.find({userId: req.body.userId}, function (err, userResults) {
          if(err){
            callback(null,{
              success: false,
              errMsg: 'find err',
              errType: '1'
            })
          }else{
            userResults[0].email = req.body.email;
            userResults[0].markModified('email');
            userResults[0].save(function (err, saveResult) {
              if(err){
                callback(null,{
                  success: false,
                  errMsg: 'save err',
                })
              }else{
                callback(null,{
                  success: true
                })
              }
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errType: '0'
        })
      }
    }
  }, function(err, finalResult){
    console.log('f err', err)
    console.log('department', finalResult.updateDepartment)
    if(err){
      res.send({
        success: false
      })
    }else{
      switch (req.body.changeType){
        case '0':
          if(finalResult.updateAvatar.success){
            res.send({
              success: true
            });
            break;
          }else{
            res.send({
              success: false
            });
            break;
          }
        case '1':
          if(!finalResult.vertificationNickName.success){
            return res.send({
              success: false,
              errCode:'1'
              //1--说明没通过
            })
          }
          if(finalResult.updateNickName.success){
            res.send({
              success: true
            });
            break;
          }else{
            res.send({
              success: false,
              errCode:'2'
              //2--说明修改失败
            });
            break;
          }
        case '2':
          if(finalResult.updatePassword.success){
            res.send({
              success: true
            })
            break;
          }else{
            res.send({
              success: false,
              errType: finalResult.updatePassword.errType
            })
            break;
          }
        case '3':
          if(finalResult.updateRealName.success){
            res.send({
              success: true
            })
            break;
          }else{
            res.send({
              success: false
            })
            break;
          }
        case '4':
          if(finalResult.updateDepartment.success){
            res.send({
              success: true
            });
            break;
          }else{
            res.send({
              success: false
            });
            break;
          }
        case '5':
          if(finalResult.updateJobName.success){
            res.send({
              success: true
            });
            break;
          }else{
            res.send({
              success: false
            });
            break;
          }
        case '6':
          if(finalResult.updateWechat.success){
            res.send({
              success: true
            });
            break;
          }else{
            res.send({
              success: false
            });
            break;
          }
        case '7':
          if(finalResult.updatePhoneNumber.success){
            res.send({
              success: true
            })
            break;
          }else {
            res.send({
              success: false
            })
            break;
          }
        case '8':
          if(finalResult.updateEmail.success){
            res.send({
              success: true,
            });
            break;
          }else{
            res.send({
              success: false
            })
            break
          }
        default:
          res.send({
            success: false,
            msg: 'default'
          })
      }
    }
  })
});
//TODO 改
//其实这里的所有success可以用函数返回的success加errType来返回到前端，这样代码短并且前端也知道是什么出错


//后台修改用户基本信息
router.post('/admin/edit/user', function(req, res){
  user.find({userId: req.body.userId}, function (err, userResults) {
    if(err){
      res.send({
        success: false,
        errMsg: '数据库错误'
      })
    }else{
      userResults[0].nickName = req.body.nickName;
      userResults[0].email = req.body.email;
      userResults[0].realName.name = req.body.realName;
      userResults[0].wechat = req.body.wecaht;
      userResults[0].phoneNumber = req.body.phoneNumber;
      userResults[0].markModified('nickName');
      userResults[0].markModified('email');
      userResults[0].markModified('realName');
      userResults[0].markModified('wechat');
      userResults[0].markModified('phoneNumber');
      userResults[0].save(function (err, saveResult) {
        if(err){
          res.send({
            success: false,
            errMsg: '保存失败'
          })
        }else{
          res.send({
            success: true
          })
        }
      })

    }
  })
});

//后台查看用户详情
router.get('/admin/user', function(req, res){
  async.auto({
    getUser: function (callback) {
      console.log('query',req.query)
      user.find({userId: req.query.userId}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            userObj: null,
            errMsg: '数据库查找失败'
          })
        }else{
          callback(null,{
            success: true,
            userObj: userResults[0]
          })
        }
      })
    },
    getUserTopics: ['getUser', function (results, callback) {
      if(results.getUser.success){
        var topics = results.getUser.userObj.topics;
        async.map(topics, function (item, cb) {
          topic.find({topicId: item.topicId}, function (err, teamResults) {
            if(err){
              cb(null,'find err')
            }else{
              cb(null, teamResults[0])
            }
          })
        }, function (err, mapResults) {
          if(err){
            console.error(err)
            callback(null,{
              success: false,
              errMsg: 'map err',
              topics: null
            })
          }else{
            callback(null,{
              success: true,
              topics: mapResults
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.getUser.errMsg,
          topics: null
        })
      }
    }],
    getTaskNode: ['getUser', function(results, callback){
      if(results.getUser.success){
        var taskArr = results.getUser.userObj.taskArr;
        var tasks = results.getUser.userObj.tasks;
        async.map(taskArr, function (item, cb) {
          task.find({taskId: item.taskId}, function(err, taskResults){
            if(err){
              cb(null,'find err')
            }else{
              async.map(taskResults[0].taskArr, function (s_item, s_cb) {
                for(var j = 0; j < s_item.users.length; j++){
                  if(s_item.users[j].id == req.query.userId){
                    break;
                  }
                }
                if(j < s_item.users.length){
                  var taskObj = {
                    taskMsg: taskResults[0],
                    taskNode: s_item
                  }
                  s_cb(null, taskObj)
                }else{
                  s_cb(null)
                }
              }, function (err, s_mapResults) {
                if(err){
                  cb(null,'err')
                }else{
                  //console.log('s_mapResults', s_mapResults)
                  cb(null, s_mapResults)
                }
              })
            }
          })
        }, function (err, mapResults) {
          if(err){
            callback(null,{
              success: false,
              tasks:[]
            })
          }else{
            var taskNode =  _.compact(mapResults[0]);
            callback(null,{
              success: true,
              tasks: _.compact(mapResults[0])
            })
            //console.log('map resuls', _.compact(mapResults[0]))
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.getUser.errMsg,
          tasks: null
        })
      }
    }],
    getTaskNodeCreaterName: ['getTaskNode', function (results, callback) {
      if(results.getTaskNode.success){
        async.map(results.getTaskNode.tasks, function (item, cb) {
          user.find({userId: item.taskNode.creater.userId}, function (err, userResults) {
            if(err){
             cb(null,'find err')
            }else{
              item.taskNode.creater.name = userResults[0].nickName
              cb(null, item)
            }
          })
        }, function(err, mapResults){
          if(err){
            callback(null,{
              success: false
            })
          }else{
            callback(null)
          }
        })
      }
    }],
    getTeams:['getUser', function (results, callback) {
      if(results.getUser.success){
        async.map(results.getUser.userObj.teams, function (item, cb){
          team.find({teamId: item.teamId}, function(err, teamResults){
            if(err){
              cb(null,'find err')
            }else{
              cb(null, teamResults[0])
            }
          })
        }, function (err, mapResults) {
          console.log('team map', mapResults);
          if(err){
            callback(null,{
              success: false,
              errMSg: 'map err',
              teams: []
            })
          }else{
            callback(null,{
              success: true,
              teams: mapResults
            })
          }
        })
      }else{
        callback(null,{
          success: false,
          errMsg: results.getUser.errMsg,
          teams: []
        })
      }
    }],
    getTeamManager: ['getTeams', function (results, callback) {
      var teams = results.getTeams.teams;
      async.map(teams, function (item, cb) {
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
            success: false
          })
        }else{
          callback(null)
        }
      })
    }]
  }, function (err, finalResults) {
    if(err){
      res.render('404page')
    }else{
      res.render('back-user',{
        success: true,
        user: finalResults.getUser.userObj,
        topics: finalResults.getUserTopics.topics,
        tasks: finalResults.getTaskNode.tasks,
        teams: finalResults.getTeams.teams
      })
    }
  })
})

router.post('/img', function (req, res) {
  var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
  p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
  p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
})
module.exports = router;