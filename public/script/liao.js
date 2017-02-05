/**
 * Created by MengL on 2016/12/7.
 */

$("#createTopic").click(function () {
  $('.shade input').val("");
  $('.shade textarea').val("")
  $("#shadeTopic").show();
});
$('.shade').click(function (e) {
  $(this).hide();
});
$("#createTask").click(function () {
  $('.shade input').val("");
  $('.shade textarea').val("")
  $("#shadeTask").show();
});

$("#joinTopic").click(function () {
  $("#shadeJoinTopic").show();
});
$('.shade').children().click(function (e) {
  e.stopPropagation();
});

//获取团队下的任务列表选择关联
$("#relateToTask").click(function (e) {
  e.preventDefault();
  $.ajax({
    url:'/tasks',
    type:"GET",
    success: function (data) {
      if(data.success){
        console.log('daa',data)
      }
    }
  })
});

//创建一个话题
$("#newTopic").click(function (e) {
  e.preventDefault();
  if($("input[name='topic-title']").val() == ""){
    $('.validTitle').show();
    return;
  }
  var obj = {};
  var topicName = $("input[name='topic-title']").val();
  var topicContent = $("textarea[name='topic-content']").val();
  var endTime = $('#endTime').val();
  obj.topicName = topicName;
  obj.topicContent = topicContent;
  obj.endTime = endTime;
  obj.hasTask = false;
  //数据验证
  if(topicName == ""){
    return swal("话题标题不能为空")
  }
  if(topicContent == ""){
    return swal("请添加话题描述")
  }
  if(!moment().isBefore(endTime)|| endTime==""){
    return swal("请选择正确的时间")
  }
  $.ajax({
    type:"POST",
    url:"/create/topic",
    data: obj,
    dataType:'json',
    success: function (data) {
      if(data.success){
        window.location.href = "/topic?topicId="+ data.result.topicId;
      }else{
        swal("创建失败")
      }
    }
  })
});


//搜索话题，得到符合结果的列表
$("#joinNewTopic").click(function (e) {
  var obj = {};
  e.preventDefault();
  if($("input[name='joinName']").val() == ""){
    $("#emptySearch").show();
    return;
  }
  var name = $("input[name='joinName']").val();
  console.log(name)
  obj.name = name;
  $.ajax({
    type:'POST',
    url: "/search/topic",
    data: obj,
    dataType:"json",
    success: function (data) {
      if(data.success){
        $(".results-container").html("");
        console.log(data.topics)
        $('#shadeJoinTopic').hide();
        $('#shadeSearchResults').show();
        data.topics.forEach(function (obj, i, arr) {
          $('.results-container').append("<div class='res-title'>" + obj.title +
            "</div>" +
            "<div class='res-owner'>" + obj.owner.name +
            "</div>" +
            "<div class='res-createAt'>" + moment(obj.createAt).format('YYYY.MM.DD') +
            "</div>" +
            "<div class='btn' onclick='addTopic(" + obj.teamId + ")'>" + "加入" +
            "</div>")
        })
      }else{
        console.log('并不存在')
      }
    }
  })
});

//创建一个任务
$("#newTask").click(function (e) {
  e.preventDefault();
  if($("input[name='task-title']").val() == ""){
    $('.validTitle').show();
    return;
  }
  var obj={};
  var taskTitle = $("input[name='task-title']").val();
  var taskBrief = $("textarea[name='task-content']").val();
  var endTime = $("#taskFinishTime").val();

  if(taskTitle == ""){
    return swal("标题不能为空")
  }
  if(taskBrief == ""){
    return swal("请添加任务描述")
  }
  if(!moment().isBefore(endTime) || endTime==""){
    return swal("请选择正确的时间")
  }

  obj = {
    taskTitle: taskTitle,
    taskBrief: taskBrief,
    endAt: endTime,
    hasTopic: false
  };


  $.ajax({
    type:"POST",
    url: "/create/task",
    data: obj,
    dataType:'json',
    success: function(data){
      if(data.success){
        console.log('data',data)
        window.location.href = "/task?taskId="+ data.taskId
      }else{
        swal("创建失败，请重试")
      }
    }
  })
});


function addTopic(id){
  var obj = {};
  obj.id = id;
  console.log('addteam', id);
  $.ajax({
    type:'POST',
    url:"/join-topic",
    data:obj,
    dataType:'json',
    success: function (data) {
      if(data.success){
        alert("已提交")
      }else{
        return console.log("失败")
      }
    }
  })
}


$('#endTime').dateRangePicker({
  autoClose: true,
  singleDate : true,
  showShortcuts: false,
  singleMonth: true
});
$('#taskFinishTime').dateRangePicker({
  autoClose: true,
  singleDate : true,
  showShortcuts: false,
  singleMonth: true
});

var socket = io.connect('/');

socket.on('to'+ $("#userId").val(), function (data) {
  $(".new-msg").show();
});
socket.on('news', function (data) {
  alert(data)
});
socket.emit('setSocket', $("#userId").val());
