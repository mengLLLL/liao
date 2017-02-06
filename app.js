/**
 * Created by MengL on 2016/12/1.
 */
var express = require('express');
var port = 9000;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var credentials = require('./credentials');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var topic = require('./mongoDB/models/topic.js');
var async = require('async');



var flash = require('connect-flash');
var path = require('path');

var route = require('./routes/index');
//database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/liao');

var user = require('./mongoDB/models/user.js');
var team = require('./mongoDB/models/team.js');
var topic = require('./mongoDB/models/topic.js');
var task = require('./mongoDB/models/task.js');

//locals setting
var moment = require('moment');
moment.locale("zh-cn");
app.locals.moment = moment;
app.locals.jq = require('jquery');

//jade setting
app.set('views', './views/pages/');
app.set('view engine', 'jade');

//bodyParser setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//路径 setting
app.use(serveStatic('node_modules'));

//static files，express.static是托管静态文件的，比如图片，css，js代码
app.use(express.static(path.join(__dirname, 'public')));



//session setting
app.use(session({
  secret:'foo',
  store:new MongoStore({
    url:credentials.mongo.development.connectionString
  }),
  resave:true,
  saveUninitialized:true,
  name:'liao',
  cookie:{
    path:'/',
    httpOnly:true,
    secure:false,
    maxAge:600000000000
  }
}));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.loginName = req.flash('loginName');
  res.locals.session = req.session;
  next()
});

http.listen(port);



var usocket = {};
var tsocket = {};
var tusocket = {};
io.on('connection', function (socket) {
  console.log('socket id', socket.id)
  socket.on('login', function (data) {
    console.log('a user is online',data)
    usocket[data] = socket;
  });
  socket.on('setSocket', function (data) {
    usocket[data] = socket;
    console.log('socket update',usocket[data].id)
  });
  socket.on('disconnect', function (data) {
    //var soid = socket.id;
    //io.to(soid).emit("disconnected","hi")
    console.log('disconnected',socket.id)
  });
  socket.on('sendNotification', function (from, to) {
    console.log('sendNotification')
    console.log('sendNotification', from ,'to', to);
    console.log('to'+to);
    if(usocket[to]){
      console.log('to id',usocket[to].id);
      usocket[to].emit('to'+to, 'hello')
    }

  });


});

//var a=[1,2,3,4,5,6,7]


var topicIO = io.of('/topic');
//topicIO.set('heartbeat timeout',2000);
var onlineUsers = {};//在线用户
var offlineUsers = {};//下线用户
var leavingUsers = {};//待下线用户
//generateArr();
topicIO.on('connection', function(socket){
  //console.log('test', arrDelete(a,2))

  var url = socket.request.headers.referer;
  var split_arr = url.split('=');
  //这里url的形式为http://localhost:9000/topic?topicId=0，所以这样简单的取出来topicId
  var topicId = split_arr[1];

  if(!onlineUsers[topicId]){
    console.log('生成')
    onlineUsers[topicId] = [];
    offlineUsers[topicId] = [];
    leavingUsers[topicId] = [];
  }

  socket.join('topic'+topicId);
  console.log('topicId', topicId);

  socket.on('public chat', function (data) {
    console.log('public chat data',data)
    newMsgNotice(onlineUsers[topicId], topicId);
    topicIO.to('topic'+data.topicId).emit('public',data);
    //console.log('public chat', onlineUsers[topicId])
  });
  socket.on('setSocket', function (data) {
    //这里是当用户打开topic页面的时候，加到onlinusers数组中，并且要去检查待通知用户的数组里有没有他，如果有，要删掉
    updateNoticeWho(topicId,data);
    console.log('start',onlineUsers[topicId]);
    socket.userId = data;

    if(onlineUsers[topicId].length){
      onlineUsers[topicId].push(data);
      console.log('push after online',onlineUsers[topicId])

    }else{
      if(onlineUsers[topicId].indexOf(data) < 0){
        //不存在online数组中
        onlineUsers[topicId].push(data);
        console.log('push after online',onlineUsers[topicId])

      }
    }

    tusocket[data] = socket;
  });
  socket.on('sendNotification', function (from, to) {
    console.log('sendNotification namespace', from ,'to', to);
    if(tusocket[to]){
      console.log('to id',tusocket[to].id);
      tusocket[to].emit('to'+to, 'hello')
    }
  });
  socket.on('disconnect', function (data) {
    //console.log('socket userid',socket.userId)
    if(socket.userId){
      //有userId的话
      console.log('delete after',arrDelete(onlineUsers[topicId], socket.userId))
      onlineUsers[topicId] = arrDelete(onlineUsers[topicId], socket.userId) ;
      leavingUsers[topicId].push(socket.userId);
      console.log('disconnect leavingUsers',leavingUsers);
      console.log('disconnect onlineUsers', onlineUsers);
      console.log('disconnect leavingUsers', leavingUsers)
      setTimeout(function () {
        if(onlineUsers[topicId].indexOf(socket.userId) !== -1){
          console.log(socket.userId,'在哟');
          leavingUsers[topicId] = arrDelete(leavingUsers[topicId], socket.userId);
        }else{
          console.log(socket.userId,'离开了');
          offlineUsers[topicId].push(socket.userId);
          leavingUsers[topicId] = arrDelete(leavingUsers[topicId], socket.userId);

        }
      }, 10000)
    }
    //console.log('disconnect')
    //console.log('onlineUsers', onlineUsers)
  })

});
route(app);

/***
 * 删除数组中的某个元素
 * @param arr
 * @param item
 * @returns {*}
 */

function arrDelete(arr, item){
  for(var i = 0; i< arr.length; i++){
    if(arr[i] == item){
      break;
    }
  }
  if(i == arr.length){
    console.log('not found')
    return arr
  }else{
    arr.splice(i,1)
    return arr
  }
}

/**
 * 生成onlineUsers、offlineUsers、leavingUsers
 */
function generateArr(){
  topic.count(function (err, count) {
    for(var i = 0;i < count; i++){
      onlineUsers[i] = [];
      offlineUsers[i] = [];
      leavingUsers[i] = [];
    }
  })
}

/**
 * 检查话题的members数组，如果某用户在在线用户表里面，那么就要去检查是不是在noticeWho数组里面，如果在就删掉，不在没有任何操作
 * 如果某用户不在在线用户表里面，那么就要把它加到noticeWho数组里面，这样该用户登录的时候就会收到有新消息的提示
 * @param onlineUserArr
 * @param topicId
 */
function newMsgNotice(onlineUserArr, topicId){
  console.log('onlineUsers 执行', onlineUserArr)
  topic.find({topicId: topicId}, function (err, topicResults) {
    if(err){
      return console.error('find err')
    }else{
      async.map(topicResults[0].members, function (item, cb) {
        if(onlineUserArr.indexOf(item.userId) < 0){
          console.log(item.userId,'不在线')
          //该用户不在线
            for(var m = 0; m< topicResults[0].noticeWho.length; m++){
              if(topicResults[0].noticeWho[m].userId == item.userId){
                console.log('在待通知用户列表里找到了！')
                break;
              }
            }
            if(m == topicResults[0].noticeWho.length){
              console.log(item.userId,'不在被通知的用户表，push')
              //不在被通知的用户表里面
              cb(null,{
                push:true,
                userId: item.userId
              });
            }else{
              cb(null)
            }
        }else{
          //用户在线，要去检查在不在被通知的用户列表里，如果在要删除
          console.log(item.userId,'在线');
          for(var n = 0; n < topicResults[0].noticeWho.length; n++){
            if(topicResults[0].noticeWho[n].userId == item.userId){
              break;
            }
          }
          if(n < topicResults[0].noticeWho.length){
            //说明在要被通知的用户数组里面,删掉
            console.log('要删掉了')
            cb(null,{
              push: false,
              userId: item.userId
            })
          }else{
            cb(null)
          }
        }
      }, function (err, mapResults) {
        console.log('map finished',mapResults)
         //在这里push或者delete
        mapResults.forEach(function (obj, item, arr) {
          if(obj){
            //有可能是undefined，所以这里加if
            if(obj.push){
              //push
              topicResults[0].noticeWho.push({
                userId: obj.userId
              })
            }else{
              //splice
              for(var g=0; g< topicResults[0].noticeWho.length; g++){
                if(obj.userId == topicResults[0].noticeWho[g].userId){
                  break;
                }
              }
              if(g < topicResults[0].noticeWho.length){
                topicResults[0].noticeWho.splice(g,1)
              }
            }
          }
        });
        topicResults[0].markModified('noticeWho');
        topicResults[0].save(function (err,saveResult) {
          console.log('save result', saveResult.noticeWho)
        })
      });
    }
  })
}

/**
 * 用户打开某话题的页面之后，要去把该话题的noticWho数组做个更新，如果有该用户要删掉
 * @param topicId
 * @param userId
 */
function updateNoticeWho(topicId, userId){
  topic.find({topicId: topicId}, function (err, topicResults) {
    if(err){
      return console.error(err)
    }else{
      for(var i = 0; i < topicResults[0].noticeWho.length; i++){
        if(topicResults[0].noticeWho[i].userId == userId){
          break;
        }
      }
      if(i < topicResults[0].noticeWho.length){
        topicResults[0].noticeWho.splice(i,1)
        topicResults[0].markModified('noticeWho');
        topicResults[0].save(function(err, saveResult){
          if(err){
            return console.error(err)
          }
        })
      }
    }
  })
}