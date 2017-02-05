/**
 * Created by MengL on 2016/12/14.
 */
var socket = io.connect('/');
socket.on('to'+ $("#userId").val(), function (data) {
  $(".new-msg").show();
});


//aType将区分是什么的agree
//1：同意加入团队
//2：同意加入话题？

$(".agreeOne").click(function (e) {
  var teamId = $(this).data('tid');
  var notificationId = $(this).data('nid');
  var requestId = $(this).data('rid');
  var applyName = $("#applyUser").val();
  var obj = {
    teamId: teamId,
    notificationId: notificationId,
    requestId: requestId,
    aType: 1,
    applyName :applyName
  };

  $.ajax({
    url:"/agree",
    data:obj,
    type:"POST",
    dataType:'json',
    success: function (data) {
      if(data.success){
        console.log('已经同意加入团队')
        $("#noti"+notificationId).remove();
      }
    }
  })
});

$(document).ready(function () {
  $('.header-tab').click(function (e) {
    $(this).siblings().removeClass('active');
    $(this).addClass('active')
    $('.msg-box').removeClass('show')
    $('#'+ $(this).data('type')).addClass('show');
  })
});
