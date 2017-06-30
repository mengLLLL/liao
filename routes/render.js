/**
 * Created by MengL on 2016/12/1.
 */
var express = require('express');
var router = express.Router();
var user = require('../mongoDB/models/user.js');
var team = require('../mongoDB/models/team.js');
var topic = require('../mongoDB/models/topic.js');
var task = require('../mongoDB/models/task.js');
var async = require('async');
var moment = require('moment');
var _ = require("lodash");
var captchapng = require('captchapng');

//首页
router.get('/', function (req, res) {
  res.render('login')
});

//获取当前团队下面的我参与的所有话题（检查teamID为session中的，然后去检查该topic的members数组是否有自己，有就push进去就行了）
//获取当前团队下面的我参与的所有任务
router.get('/liao', function (req, res) {
  var teamId = req.session.team.teamId;
  async.auto({
    getTopics: function(callback){
      topic.find({teamId: teamId}, function (err, topicResults) {
        if(err){
          callback(null, 'find err')
          return console.error(err)
        }
        var topics=[];
        async.map(topicResults, function (item, cb) {
          //console.log('item', item)
          for(var j=0;j<item.members.length;j++){
            if(req.session.user.userId == item.members[j].userId){
              topics.push(item);
              break;
            }
          }
          cb(null)
        }, function (err, mapResults) {
          //console.log('finalTopics',topics);
          if(err){
            callback(null,'map err')
            return console.error(err)
          }else{
            callback(null, topics)
          }
        })
      })
    },
    topicWithState:['checkTopics', function (results, callback) {
      //检查该话题是不是有@自己
      var newTopics=[];
      var newObj;
      var topics = results.getTopics;
      topics.forEach(function (obj, i, arr) {
        //遍历话题
         newObj = obj;
        for(var m=0; m<obj.atwho.length; m++){
          //检查话题的atwho数组
          if(req.session.user.userId == obj.atwho[m].userId){
            //找到了有关@自己的信息,去检查@自己的是不是同一个人
            async.map(obj.atwho[m].from, function (item, cb) {
              cb(null, item.userName)
            }, function (err, mapResults) {
              if(err){
                return console.error(err)
              }else{
                newObj.atUser = _.uniq(mapResults)
              }
            });
            break;
          }
        }
        //console.log('obj atuser',newObj.atUser)
        //console.log('obj',newObj)
        newTopics.push(newObj)
      });
      callback(null,newTopics)
    }],
    getTopicOwnerMsg: ['topicWithState', function(results, callback){
      //这一步竟然改变了topicWithState的结果，这也太不合理了啊，为什么啊
      // TODO 不合理，想不通为什么可以改变topicWithState的结果！
      var topicsArr = results.topicWithState;
      async.map(topicsArr, function (item, cb) {
        user.find({userId: item.owner.id}, function (err, userResults) {
          if(err){
            cb(null,'find err')
          }else{
            item.owner.name = userResults[0].nickName;
            item.owner.avatar = userResults[0].avatar;
            cb(null, item)
          }
        })
      }, function (err, mapResults) {
        //console.log('map results', mapResults);
        if(err){
          callback(null, 'map err')
        }else{
          callback(null)
        }
      })
    }],
    checkTopics: ['getTopics', function (results, callback) {
      //检查是否逾期
      var topics = results.getTopics;
      async.map(topics, function (item, cb) {
        if(item.condition == 0){
          if(!moment().isBefore(item.endAt)){
            item.condition=2;
            item.markModified('condition');
            item.save(function (err, saveResult) {
              if(err){
                cb(null,'save err');
                return console.error(err)
              }else{
                cb(null,'checked and saved!');
              }
            })
          }else{
            cb(null)
          }
        }else{
          cb(null)
        }

      }, function (err, mapResults) {
        if(err){
          callback(null, 'err')
          console.error(err)
        }else{
          callback(null,topics)
        }
      });
    }],
    getTasks: function (callback) {
      task.find({teamId: teamId}, function (err, taskResults) {
        if(err){
          callback(null,'find err')
          return console.error(err)
        }else{
          var tasks = [];
          async.map(taskResults, function(item, cb){
            for(var j = 0; j< item.members.length; j++){
              if(req.session.user.userId == item.members[j].userId){
                tasks.push(item);
                break;
              }
            }
            cb(null)
          }, function (err, mapResults) {
            if(err){
              callback(null, 'map err')
            }else{
              callback(null, tasks)
            }
          })
        }
      })
    },
    checkTasks: ['getTasks', function (results, callback) {
      var tasks = results.getTasks;
      async.map(tasks, function (item, cb) {
        if(item.condition == 0){
          if(!moment().isBefore(item.endAt)){
            item.condition = 2;
            item.markModified('condition');
            item.save(function (err, saveResult) {
              if(err){
                cb(null,'save err')
                return console.error(err)
              }else{
                cb(null,'checked adn saved')
              }
            })
          }else{
            cb(null)
          }
        }else{
          cb(null)
        }
      }, function (err, mapResults) {
        if(err){
          callback(null,'err');
          return console.error(err)
        }else{
          callback(null,tasks)
        }
      })
    }],
    getTaskOwnerMsg: ['checkTasks', function (results, callback) {
      var tasks = results.checkTasks;
      async.map(tasks, function (item, cb) {
        user.find({userId: item.owner.id}, function (err, userResults) {
          if(err){
            cb(null,'find err')
          }else{
            item.owner.name = userResults[0].nickName;
            item.owner.avatar = userResults[0].avatar;
            cb(null,item)
          }
        })
      }, function (err, mapResults) {
        if(err){
          callback(null, 'map err')
        }else{
          callback(null)
        }
      })
    }]
  }, function (err, finalResults) {
    //console.log('finalresults topic', finalResults.topicWithState);
    res.render('liao',{
      topics: finalResults.topicWithState,
      tasks: finalResults.checkTasks
    })
  });
  console.log('liao session', req.session.team)




});

router.get('/404', function (req, res) {
  res.render('404page')
});


router.get('/backstage', function (req, res) {
  async.auto({
    getUsers: function (callback) {
      user.find({}, function (err, userResults) {
        if(err){
          callback(null,{
            success: false,
            users: [],
            errType: '1'
          })
        }else{
          callback(null,{
            success: true,
            users: userResults
          })
        }
      })
    },
    getTeams: function (callback) {
      team.find({}, function (err, teamResults) {
        if(err){
          callback(null,{
            success: false,
            teams:[],
            errType: '1'
          })
        }else{
          callback(null,{
            success: true,
            teams: teamResults
          })
        }
      })
    },
    getTeamOwnerMsg: ['getTeams', function (results,callback) {
      if(results.getTeams.teams.length > 0){
        async.map(results.getTeams.teams, function(item, cb){
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
      }
    }]
  }, function(err, finalResults){
    if(err){
      console.error(err)
    }
    res.render('back-allUser',{
      users: finalResults.getUsers.users,
      teams: finalResults.getTeams.teams
    })
  })
});

router.get('/backstage/team', function (req, res) {
  async.auto({
    getTeams: function (callback) {
      team.find({}, function (err, teamResults) {
        //console.log('teams', teamResults)
        if(err){
          callback(null,{
            success: false,
            errMsg: 'find err'
          })
        }else{
          callback(null,{
            success: true,
            teams: teamResults
          })
        }
      })
    },
    getTeamOwnerMSg: ['getTeams', function(results, callback){
      if(results.getTeams.success){
        async.map(results.getTeams.teams, function (item, cb) {
          user.find({userId: item.manager.id}, function(err, userResults){
            if(err){
              cb(null,'find err')
            }else{
              var teamObj = {
                team: item,
                teamOwner:{
                  nickName: userResults[0].nickName,
                  userId: userResults[0].userId,
                  realName: userResults[0].realName.name
                }
              }
              cb(null,teamObj)
            }
          })
        }, function (err, mapResults) {
          //console.log('map ddd',mapResults)
          if(err){
            callback(null,{
              success: false
            })
          }else{
            callback(null,{
              success: true,
              teams: _.compact(mapResults)
            })
          }
        })
      }
    }]
  }, function (err, finalResults) {
    if(err){
      res.render('404Page')
    }else{
      if(finalResults.getTeamOwnerMSg.success){
        //console.log('dd',finalResults.getTeamOwnerMSg)
        res.render('back-allTeam',{
          teams: finalResults.getTeamOwnerMSg.teams
        })
      }else{
        res.render('404Page')
      }
    }
  })

})
module.exports = router;