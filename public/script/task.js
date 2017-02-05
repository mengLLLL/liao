/**
 * Created by MengL on 2016/12/20.
 */

var socket = io.connect('/');
socket.on('to'+ $("#userId").val(), function (data) {
  $(".new-msg").show();
});

var taskId = $('#taskId').data('taskid');
$('#taskEndTime').dateRangePicker({
  autoClose: true,
  singleDate : true,
  showShortcuts: false,
  singleMonth: true
});
$("#endTime").dateRangePicker({
  autoClose: true,
  singleDate : true,
  showShortcuts: false,
  singleMonth: true
});
$("#newEndTime").dateRangePicker({
  autoClose: true,
  singleDate : true,
  showShortcuts: false,
  singleMonth: true
});


$("#addNewTopic").click(function () {
  $('.shade input').val("");
  $(".shade textarea").val("");
  $("#addTopic").show()
});
$('.shade').children().click(function (e) {
  e.stopPropagation();
});
$('.shade').click(function (e) {
  $(this).hide();
});


/**
 * 删除文件，只有话题主和上传的人可以删除
 */

$('.deleteFile').click(function(e){
  e.stopPropagation();
  var taskId = $("#taskId").data('taskid');
  var file_id = $(this).parent('.file-item').attr('id');
  //文件上传者id
  var fileUperId = $(this).parent('.file-item').data("upuserid");
  //想删除文件的人的id
  var userId = $(".middle").data('userid');
  //话题主的id
  var taskOwnerId =$(".middle").data('ownerid');
  //检验是否有权限去删除
  if(userId == fileUperId || userId == taskOwnerId){
    //有权限
    var fileobj = {
      file_id: file_id,
      taskId: taskId
    };

    $.ajax({
      url:'/task/delete/file',
      data: fileobj,
      type:"POST",
      dataType:'json',
      success: function(data){
        console.log('delete',data)
        if(data.success){
          swal("删除成功！");
          $('#'+file_id).remove();
          console.log(data)
        }
      }
    })
  }else{
    //无权限
    swal('您没有权限删除此文件')
  }
});


//事件委托
$(".file-box").click(function (e) {
  console.log($(e.target));
  if($(e.target).hasClass('file-item')){
    //预览
    if($(e.target).data('filetype')==1){
      console.log('预览')
      $("#filePreview").children('.box').html("")
      e.stopPropagation();
      $("#filePreview").children('.box').prepend('<img src="'+$(e.target).data('src')+'">');
      $("#filePreview").show();
    }
  }
  if($(e.target).hasClass('collectFile')){
    console.log('要收藏文件啦',$(e.target).parent());
    e.stopPropagation()
    var file_id = $(e.target).parent().attr('id');
    var obj = {
      file_id: file_id,
      taskId: taskId
    }
    console.log('obj', obj)
    $.ajax({
      type: 'POST',
      url:'/task/file/collect',
      data: obj,
      dataType: 'json',
      success: function (data) {
        if(data.success){
          console.log('data',data)
          $(e.target).removeClass('fa-star-o collectFile').addClass('fa-star cancelCollect');
        }
      }
    })
  }
  if($(e.target).hasClass('cancelCollect')){
    e.stopPropagation()
    console.log('quxiaoshoucang',$(e.target).parent());
    var file_id = $(e.target).parent().attr('id');
    var obj = {
      file_id: file_id,
      taskId: taskId
    };
    console.log('obj,',obj)

    $.ajax({
      type: 'POST',
      url: '/task/file/cancel',
      data: obj,
      dataType: 'json',
      success: function (data) {
        console.log('data',data)
        if(data.success){
          $(e.target).removeClass('fa-star cancelCollect').addClass('fa-star-o collectFile')
        }
      }
    })
  }
});


//添加任务节点shade
$("#addNewTaskNode").click(function (e) {
  $("#nodeTask").show()
})
$("#getMembers").click(function (e) {
  e.preventDefault();
  var teamId = $("#getMembers").data("teamid");
  var obj = {
    teamId: teamId,
    task: true,
    topic: false
  };
  $.ajax({
    type:"POST",
    url:"/members/team",
    data:obj,
    dataType: 'json',
    success: function (data) {
      if(data.success){
        var members = data.teamMembers;
        console.log('data',data)
        members.forEach(function (obj, i, arr) {
          $(".member-list").append("<div class='member-item'> " +
            "<input type='checkbox' name='member' class='chkb'  value='"+ obj.name +"' data-id='"+ obj.userId +"'>" +
            "<img src='"+obj.avatar+"' class='avatar'>" +
            "<span class='name'>"+obj.name +
            "</span>" +
            "</div>")
        })
      }
    }
  })
});

//添加任务节点
$("#createTaskItem").click(function(e){
  e.preventDefault();
  var taskId = $(".task-title").data('taskid');
  var endTime = $("#taskEndTime").val();
  var brief = $("#taskItemBrief").val();
  var members = [];
  var inputs = $("input[name='member']");
  var taskSum = parseInt($("#taskSum").val());
  var taskWorking = parseInt($("#taskWorking").val());
  if(brief == ""){
    return swal("请输入任务描述")
  }

 if(!moment().isBefore(endTime)){
    return swal('请选择正确的时间') ;
  }

  moment.locale('zh-cn');
  var i = 0;
  for( i; i< inputs.length; i++){
    if(inputs[i].checked){
      members.push({
        id: $(inputs[i]).data("id"),
        name: inputs[i].value
      })
    }
  }
  if(members.length == 0){
    return alert('请选择任务的执行人');
  }

  var obj = {
    endTime: endTime,
    members: members,
    taskId: taskId,
    brief: brief
  };
  $.ajax({
    type:"POST",
    url:"/add/node",
    data: obj,
    dataType:'json',
    success: function(data){
      if(data.success){
        console.log('data',data);
        $("#nodeTask").hide()
        var from = data.task.owner.id;
        $('.task-items').append("<div class='task-node working'>" +
          "<input type='checkbox' value='task-"+data.taskItem.taskItemId+"' >" +
          "<span class='task-brief'>"+data.taskItem.brief+"</span>" +
          "<div id='taskMembers-"+data.taskItem.taskItemId+"' class='task-node-member'>执行人：" +
          "</div>" +
          "<span class='task-endTime'>距今还有"+moment(data.taskItem.endAt,"YYYYMMDD").fromNow(true)+"</span>" +
          "</div>")
        data.taskItem.users.forEach(function (obj, i, arr) {
          $("#taskMembers-"+data.taskItem.taskItemId).append("<span class='task-host' data-userid='"+obj.userId+"'>"+obj.name+"</span>")
        })

        $("#taskSum").val(taskSum+1);
        $("#taskWorking").val(taskWorking + 1);
        $("#taskPercent").val(data.task.statistics.percent+"%")
        data.task.members.forEach(function (obj, i, arr) {
          socket.emit("sendNotification",from, obj.userId)
        })
      }
    }
  })
});

//创建任务下面的话题
$("#newTopic").click(function (e) {
  e.preventDefault();
  var obj = {};
  var topicName = $("input[name='topic-title']").val();
  var topicContent = $("textarea[name='topic-content']").val();
  var endTime = $('#endTime').val();
  var taskId = $("#taskId").data("taskid")
  if(topicName == ""){
    return swal("话题标题不能为空")
  }
  if(topicContent == ""){
    return swal("话题描述不能为空")
  }
  if(!moment().isBefore(endTime)){
    return swal('请选择正确的时间') ;
  }
  obj = {
    topicName: topicName,
    topicContent: topicContent,
    endTime : endTime,
    hastask: true,
    taskId: taskId
  }
  $.ajax({
    type:"POST",
    url:"/create/topic",
    data:obj,
    dataType:"json",
    success: function(data){
      if(data.success){
        console.log('data',data)
        window.location.href="/topic?topicId="+data.result.topicId;
      }
    }
  })
});

$("#setting").click(function (e) {
  $("#taskSetting").show()
});
//任务设置
$("#updateTask").click(function (e) {
  e.preventDefault();
  var title = $("input[name='task-title']").val();
  var brief = $("textarea[name='task-brief']").val();
  var endAt = $("input[name='task-endAt']").val();
  var taskId = $("#taskId").data("taskid");
  var obj = {
    taskId: taskId,
    title: title,
    brief: brief,
    endAt: endAt,
    set_type: 1
  };
  $.ajax({
    type:"POST",
    url:"/setting/task",
    data: obj,
    dataType: 'json',
    success: function (data) {
      if(data.success){
        var task = data.updateTask;
        $("#taskSetting").hide();
        $("#taskId").html(task.title);
        $("#taskBrief").html(task.brief);
        $(".end-time").html(moment(task.endAt).format('YYYY.MM.DD'));
        $(".from-now").html("距今还有 "+ moment(task.endAt,'YYYYMMDD').fromNow(true));


      }
    }
  })
});
$("#closeTask").click(function (e) {
  e.preventDefault();
  var taskId = $("#taskId").data("taskid");
  var obj = {
    taskId: taskId,
    set_type: 2
  };
  $.ajax({
    type:"POST",
    url:"/setting/task",
    data: obj,
    dataType: 'json',
    success: function (data) {
      if(data.success){
        window.location.href="/liao"
      }
    }
  })
});


/***
 * 完成某个子任务节点
 * @param taskItemId 该子任务节点的id
 */
function finishTask(taskItemId,userW){

  var taskMembers = $("#taskMembers-" + taskItemId).children("span").contents();
  console.log(taskMembers)
  var flag = false;
  for(var j = 0; j < taskMembers.length; j++){
    console.log(typeof taskMembers[j].nodeValue)
    console.log(taskMembers[j].nodeValue == userW)
    if(taskMembers[j].nodeValue == userW){
      flag = true;
      break
    }
  }
  if(flag == true){
    var taskId = $(".task-title").data('taskid');
    var obj = {
      taskId: taskId,
      taskItemId: taskItemId
    };
    $.ajax({
      type: "POST",
      url: "/finish/taskitem",
      data: obj,
      dataType: 'json',
      success: function(data){
        if(data.success){
          console.log('data',data)
          $("#node-"+taskItemId).addClass('done');
          $("#taskPercent").val(data.task.statistics.percent+"%");
          $("#taskWorking").val(data.task.statistics.working)
          $("#taskFinish").val(data.task.statistics.finished)
          //给任务主发送完成任务的通知
          socket.emit('sendNotification',data.users[0].id, data.task.owner.id)
          $("input[value='task-" + taskItemId +"'").hide();
        }
      }
    })
  }else{
    return swal("你没有权利完成更改这项任务的状态")
  }
}