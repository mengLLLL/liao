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


//首页
router.get('/', function (req, res) {
  res.render('index')
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
          console.log('item', item)
          for(var j=0;j<item.members.length;j++){
            if(req.session.user.userId == item.members[j].userId){
              topics.push(item);
              break;
            }
          }
          cb(null)
        }, function (err, mapResults) {
          console.log('finalTopics',topics);
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
          return console.error(err)
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
    }]
  }, function (err, finalResults) {
    console.log('finalresults', finalResults.topicWithState);
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





module.exports = router;