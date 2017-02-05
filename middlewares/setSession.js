/**
 * Created by MengL on 2016/12/9.
 */

var user = require('../mongoDB/models/user.js');
var team = require('../mongoDB/models/team.js');
var async = require('async');

module.exports = {
  setSession: function checkLogin(req, res, next){
    async.auto({
      getTeamId: function (callback) {
        var f_user;
        user.find({userId: req.session.user.userId}, function (err,UserResults) {
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
      req.session.team = {
        teamName: finalResults.getTeamName,
        teamId: finalResults.getTeamId
      };
      console.log('finalResults', finalResults)
    });
    next();
  }
};