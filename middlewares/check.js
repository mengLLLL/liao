/**
 * Created by MengL on 2016/12/6.
 */
module.exports = {
  checkLogin: function checkLogin(req, res, next){
    //console.log('checkLogin', req.session)
    if(!req.session.user|| req.session.user.userId == undefined){
      return res.redirect('/login');
    }
    next();
  }
};