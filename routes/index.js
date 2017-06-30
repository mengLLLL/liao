/**
 * Created by MengL on 2016/12/1.
 */
var checkLogin = require('../middlewares/check.js').checkLogin;
var checkAdmin = require('../middlewares/check.js').checkAdmin;
var setSession = require('../middlewares/setSession.js').setSession;

module.exports = function (app) {
  //留作首页
  app.get('/', require('./render'));
  //登录
  app.get('/login', require('./user'));
  app.post('/login', require('./user'));
  //注册
  app.get('/signup', require('./user'));
  app.post('/signup', require('./user'));
  //注册用户完善个人信息
  app.get('/complete', require('./user'));
  app.post('/complete', require('./user'));
  // 邀请成员
  app.get('/invest', require('./user'));
  //新用户
  app.get('/new', checkLogin,  require('./user'));

  //消息中心
  app.get('/message/all', checkLogin, require('./user'));

  //登出
  app.get('/logout', require('./user'));
  //创建团队
  app.get('/new/team', checkLogin,  require('./team'));
  app.post('/new/team', checkLogin, require('./team'));



  //主页
  app.get('/liao', checkLogin, require('./render'));

  //创建话题
  app.post("/create/topic", checkLogin, require('./topic'));
  //搜索话题
  //app.post("/search/topic", checkLogin, require('./topic'));


  //加入一个团队
  app.post("/join/team", checkLogin, require('./team'));
  app.get('/join/team', checkLogin, require('./team'));
  app.post('/search/team', checkLogin, require('./team'));
  app.post('/apply/team', checkLogin, require('./team'));

  //同意加入团队
  app.post('/agree', checkLogin, require('./user'));
  //拒绝加入团队
  app.post("/disagree/team", checkLogin, require('./user'));
  //得到某一个话题的页面
  app.get('/topic', checkLogin, require('./topic'));

  //发表聊天信息
  app.post('/chat', checkLogin, require('./topic'));

  //获取团队下面的所有成员，用于在话题邀请成员时
  app.post('/members/team', checkLogin, require('./team'));
  //获取话题下面的所有成员
  app.get("/members/topic", checkLogin, require('./topic'));

  //邀请某一个成员加入某个话题
  app.post('/invest/member', checkLogin, require('./user'));

  //给某个聊天动态点赞
  app.post("/chat/agree", checkLogin, require('./topic'));
  //取消点赞
  app.post('/chat/disagree', checkLogin, require('./topic'));
  //收藏某个聊天动态
  app.post("/chat/collect", checkLogin, require('./topic'));
  //取消收藏
  app.post('/chat/discollect', checkLogin, require('./topic'));
  //收藏文件
  app.post("/chat/collect/file", checkLogin, require('./topic'));
  //回复
  app.post('/chat/reply', checkLogin, require('./topic'));

  //删除文件
  app.post("/chat/delete/file", checkLogin, require('./topic'));
  app.post('/task/delete/file', checkLogin, require('./task'));
  //创建任务
  app.post('/create/task', checkLogin, require('./task'));

  //某个任务的页面
  app.get("/task", checkLogin, require('./task'));
  //新建某个任务下面的任务节点
  app.post('/add/node', checkLogin, require('./task'));
  //完成某个任务下面的任务节点
  app.post("/finish/taskitem", checkLogin, require('./task'));

  //话题设置
  app.post("/setting/topic", checkLogin, require('./topic'));
  //任务设置
  app.post("/setting/task", checkLogin, require('./task'));

  //文件，话题
  app.post("/file/topic", checkLogin, require('./topic'));
  //文件，任务
  app.post("/file/task", checkLogin, require('./task'));

  //删除话题成员
  app.post("/delete/topic", checkLogin, require("./topic"));

  //获取某用户的所有团队（切换团队用）
  app.get("/all/team", checkLogin, require('./user'));
  //切换团队
  app.get("/exchange/team", checkLogin, require('./user'));

  //根据鼠标滚动来获取历史聊天数据
  app.post("/mousewheel/chat", checkLogin, require('./topic'));

  //用户设置
  app.get("/setting/user", checkLogin, require('./user'));
  app.post("/set/user", checkLogin, require('./user'));

  //统计
  app.get("/statistics", checkLogin, require('./user'));

  //获取团队下面的所有任务
  app.get("/tasks", checkLogin, require('./task'));

  //task收藏文件
  app.post('/task/file/collect', checkLogin, require('./task'));
  //task取消收藏
  app.post('/task/file/cancel', checkLogin, require('./task'));
  //topic收藏文件
  app.post('/topic/file/collect', checkLogin, require('./topic'));
  app.post('/topic/file/cancel', checkLogin, require('./topic'));

  //user 设置
  app.post('/user/setting', checkLogin, require('./user'));

  app.get('/404', require('./render'));

  //后台得到所有用户的信息
  app.get('/backstage', checkAdmin, require('./render'));
  //后台得到所有团队的信息
  app.get('/backstage/team', checkAdmin, require('./render'));
  //后台更改用户信息
  app.post('/admin/edit/user', checkAdmin, require('./user'));
  //后台查看用户详情，比如团队、任务、话题
  app.get('/admin/user', checkAdmin,require('./user'));
  //后台更改团队信息
  app.post('/admin/edit/team', checkAdmin,require('./team'));
  app.get('/admin/team', checkAdmin, require('./team'));

  //获取验证码图片地址
  app.post('/img', require('./user'));
};