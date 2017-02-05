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
            name: req.session.user.nickName
          },
          members:[{
            id: req.session.user.userId,
            name: req.session.user.nickName
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
    getApplyTeams: function (callback) {
      user.find({userId: req.session.user.userId}, function (err, results) {
        if(err){console.error(err)}
        callback(null,results[0].applyTeams)
      })
    },
    checkTeams: ['getTeams', function (results, callback) {
      //teams是一个数组，每个项是一个对象
      var teams = results.getTeams;
      var finalTeams = [];
      //item就是每一个数组
      console.log('results', results);
      teams.forEach(function (obj, i, arr) {
        //console.log('obj', obj)
        var newitem = {
          name: obj.name,
          createAt: obj.createAt,
          manager: obj.manager.name,
          teamId: obj.teamId
        };
        //console.log('length', obj.members.length)
        for(var j = 0 ;j < obj.members.length; j++){
          console.log('oidididid',j)
          if(req.session.user.userId == obj.members[j].id){
            newitem.meng = 'true';
            console.log('hahahha',newitem.meng,newitem)
            break
          }
        }
        finalTeams.push(newitem);

      });
      console.log('finalTeams', finalTeams)
      callback(null, finalTeams)
    }]
  }, function (err, finalResults) {
    console.log('finalrResults' ,finalResults)
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
        user.update({userId: userId}, {$push:{"notification":{id: results.getNotiNum+1,msg_type: 1, team: {id: teamId,name: results.getTeamName}, from:{id:req.session.user.userId,name:req.session.user.nickName}}}}, function (msg) {
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
        //console.log('map results', results)
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

module.exports = router;