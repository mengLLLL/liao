/**
 * Created by MengL on 2016/12/5.
 */
var mongoose = require('mongoose');
var TeamSchema = new mongoose.Schema({
  name:String,
  brief:String,
  owner:Number,
  manager:{
    id: Number,
    name: String
  },
  createAt:{
    type: Date,
    default:Date.now()
  },
  teamId:{
    type: Number,
    default:0
  },
  members:[{
   id:{
     type: Number
   },
    name: String
  }],
  topics:[{
    type: Number
  }],
  tasks:[{
    type: Number
  }]
});


module.exports = TeamSchema;