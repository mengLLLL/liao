/**
 * Created by MengL on 2016/12/14.
 */

var topicId = $('#Title').data('id');
var userId = $('.middle').data('userid');
console.log('topicId', topicId)

var socket = io('/topic');
socket.emit('setSocket',userId)

socket.on('to'+ $("#userId").val(), function (data) {
  console.log('收到通知啦')
  $(".new-msg").show();
});
/**
 chat_type:
 1---文本
 2---可以预览的文件（图片）
 3---不可预览的文件
 */
socket.on('public', function(data){
  console.log('client data', data)
  if(data.chat_type == 1){
    //文本，分有无at
    if(data.at){
      //有at的话，被at的用户该条显示的不一样
      if(data.toUser.userId == userId){
        console.log('被@')
        $("#chatPart").append("<div class='chat-item' data-chatitemid='"+data.chatObj.chatItemId+"' data-chatrecordid='"+data.chatObj.chatRecordId+"'>" +
          "<div class='userMsg'>" +
          "<a href='#' class='avatar'><img src='"+data.user.avatar+"'>" +
          "</a>" +
          "<span class='name'>"+data.user.userName+"</span>" +
          "<span class='time'>"+moment(data.chatObj.createAt).format('YYYY.MM.DD HH:MM:SS')+"</span>" +
          "</div>" +
          "<div class='chatItem impressed'>" + data.chatObj.chatContent +
          "<span class='fa fa-ellipsis-h chat-operate'>" +
          "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
          "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
          "</span>"+
          "</div>" +
          "</div>")
      }else{
        $("#chatPart").append("<div class='chat-item' data-chatitemid='"+data.chatObj.chatItemId+"' data-chatrecordid='"+data.chatObj.chatRecordId+"'>" +
          "<div class='userMsg'>" +
          "<a href='#' class='avatar'><img src='"+data.user.avatar+"'>" +
          "</a>" +
          "<span class='name'>"+data.user.userName+"</span>" +
          "<span class='time'>"+moment(data.chatObj.createAt).format('YYYY.MM.DD HH:MM:SS')+"</span>" +
          "</div>" +
          "<div class='chatItem'>" + data.chatObj.chatContent +
          "<span class='fa fa-ellipsis-h chat-operate'>" +
          "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
          "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
          "</span>"+
          "</div>" +
          "</div>")
      }
    }else{
      //没有at
      $("#chatPart").append("<div class='chat-item' data-chatitemid='"+data.chatObj.chatItemId+"' data-chatrecordid='"+data.chatObj.chatRecordId+"'>" +
        "<div class='userMsg'>" +
        "<a href='#' class='avatar'><img src='"+data.user.avatar+"'>" +
        "</a>" +
        "<span class='name'>"+data.user.userName+"</span>" +
        "<span class='time'>"+moment(data.chatObj.createAt).format('YYYY.MM.DD HH:MM:SS')+"</span>" +
        "</div>" +
        "<div class='chatItem'>" + data.chatObj.chatContent +
        "<span class='fa fa-ellipsis-h chat-operate'>" +
        "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
        "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
        "</span>"+
        "</div>" +
        "</div>")
    }

  }else{
    //文件，分可不可预览
    if(data.chat_type == 2){
      //可以预览
      $("#chatPart").append("<div class='chat-item' data-chatitemid='"+data.chatObj.chatItemId+"' data-chatrecordid='"+data.chatObj.chatRecordId+"'>" +
        "<div class='userMsg'>" +
        "<a href='#' class='avatar'><img src='"+data.user.avatar+"'>" +
        "</a>" +
        "<span class='name'>"+data.user.userName+"</span>" +
        "<span class='time'>"+moment(data.chatObj.createAt).format('YYYY.MM.DD HH:MM:SS')+"</span>" +
        "</div>" +
        "<div class='chatItem'>" +"<img class='preview-img' src='"+data.chatObj.chatContent+"'>"+
        "<span class='fa fa-ellipsis-h chat-operate'>" +
        "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
        "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
        "</span>"+
        "</div>" +
        "</div>")

      $("#topicFileCenter .file-box").append("<div id='"+data.file_id+"' data-src='"+data.chatObj.chatContent+"' data-filetype='1' data-upuserid='"+data.user.userId+"' data-upusername='"+data.user.userName+"' class='file-item'>" + data.chatObj.fileName +
        "<i class='fa fa-star-o collectFile'></i>"+
        "<i class='fa fa-trash' deleteFile></i>"+
        "</div>")

    }else{
      //不可以预览

      $("#chatPart").append("<div class='chat-item' data-chatitemid='"+data.chatObj.chatItemId+"' data-chatrecordid='"+data.chatObj.chatRecordId+"'>" +
        "<div class='userMsg'>" +
        "<a href='#' class='avatar'><img src='"+data.user.avatar+"'>" +
        "</a>" +
        "<span class='name'>"+data.user.userName+"</span>" +
        "<span class='time'>"+moment(data.chatObj.createAt).format('YYYY.MM.DD HH:MM:SS')+"</span>" +
        "</div>" +
        "<div class='chatItem'>" +"<a href='"+data.chatObj.chatContent+"'>"+data.chatObj.fileName+",点击下载</a>"+
        "<span class='fa fa-ellipsis-h chat-operate'>" +
        "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
        "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
        "</span>"+
        "</div>" +
        "</div>")
      $("#topicFileCenter .file-box").append("<div id='"+data.file_id+"' data-src='"+data.chatObj.chatContent+"' data-filetype='1' data-upuserid='"+data.user.userId+"' data-upusername='"+data.user.userName+"' class='file-item'>" + "<a href='"+data.chatObj.chatContent+"'>"+data.chatObj.fileName + "下载</a>"+
        "<i class='fa fa-star-o collectFile'></i>"+
        "<i class='fa fa-trash' deleteFile></i>"+
        "</div>")
    }

  }
  document.getElementById('chatPart').scrollTop = document.getElementById('chatPart').scrollHeight;
  $('.chatItem').hover(function(){
    $(this).children('span').show()
    $(this).children('span').children('i').hide()
  }, function(){
    $(this).children('span').hide()
  });

  $('.file-item').hover(function () {
    $(this).children('i').show();
  }, function () {
    $(this).children('i').hide()
  })
});


/***
 * 邀请成员加入话题聊天
 * @param topicId 话题id
 * @param userId 被邀请的人id
 */
function investToTopic(topicId,userId){
  var from = $("#userId").val();
  var obj = {
    topicId: topicId,
    userId: userId
  };
  $.ajax({
    type:"POST",
    url:"/invest/member",
    data: obj,
    dataType:'json',
    success: function (data) {
      console.log('data',data)
      if(data.success){
        console.log('invest', data)
        swal('邀请成功');
        $("button[data-userid='" + userId + "']").parent().remove();
        $(".existed-member-list").prepend("<div class='member-item' data-userid='" + data.user.userId +"'>" +
          "<img class='avatar' src='"+data.user.avatar+"'>" +
          "<span>" + data.user.nickName +
          "</span>" +
          "<button class='manage-btn  del' data-userid='"+ data.user.userId + "' onclick='deleteMember(" + topicId + "," + data.user.userId + ")'>删除</button>" +
          "</div>")
        socket.emit('sendNotification', from, userId)
      }else{
        swal("邀请失败，请重试")
      }
    }
  })
}

/***
 * 删除话题中的某个成员
 * @param topicId
 * @param userId
 */
function deleteMember(topicId, userId){
  var obj = {
    topicId: topicId,
    userId: userId
  };
  $.ajax({
    type:"POST",
    url: "/delete/topic",
    dataType:'json',
    data: obj,
    success: function (data) {
      if(data.success){
        console.log('success');
        $("button[data-userid='" + userId + "']").parent().remove();
      }
    }
  })
}

/***
 * 对某条聊天信息点赞
 * @param chatItemId 该聊天的id
 * @param userId 点赞的人的id
 */
//TODO this获取不到被点击元素，这是个问题呀？
function chatAgree(chatItemId, chatRecordId,userId){
  var obj = {
    chatItemId: chatItemId,
    userId: userId,
    chatRecordId: chatRecordId
  };
  $.ajax({
    type:"POST",
    url:"/chat/agree",
    data:obj,
    dataType:'json',
    success:function(data){
      if(data.success){
        console.log('点赞成功')
        $("#agree-"+chatRecordId+"-"+chatItemId).removeClass('fa-thumbs-o-up').addClass('fa-thumbs-up');
        $("#agree-"+chatRecordId+"-"+chatItemId).attr('onclick', "chatDisAgree("+chatItemId+","+chatRecordId+","+userId+")");
        socket.emit('sendNotification',data.from,data.to)
      }

    }
  })
}
/**
 * 取消点赞
 * @param chatItemId
 * @param chatRecordId
 * @param userId
 */
function chatDisAgree(chatItemId, chatRecordId, userId){
  var obj = {
    chatItemId: chatItemId,
    userId: userId,
    chatRecordId: chatRecordId
  };
  $.ajax({
    type:'POST',
    url:'/chat/disagree',
    data: obj,
    dataType:'json',
    success: function(data){
      console.log('disagree!',data)
      if(data.success){
        $("#agree-"+chatRecordId+"-"+chatItemId).removeClass('fa-thumbs-up').addClass('fa-thumbs-o-up');
        $("#agree-"+chatRecordId+"-"+chatItemId).attr('onclick', "chatAgree("+chatItemId+","+chatRecordId+","+userId+")");

      }
    }
  })
}
/***
 * 收藏话题的聊天信息
 * @param chatItemId
 * @param chatRecordId
 * @param userId
 */
function chatCollect(chatItemId,chatRecordId,userId){
  var topicId = $("#Title").data('id');
  var obj = {
    chatItemId:chatItemId,
    chatRecordId: chatRecordId,
    userId: userId,
    topicId: topicId
  };
  $.ajax({
    type:"POST",
    url:"/chat/collect",
    data:obj,
    dataType:'json',
    success: function (data) {
      console.log('data',data)
      $("#collect-"+chatRecordId+"-"+chatItemId).removeClass('fa-star-o').addClass('fa-star');
      $("#collect-"+chatRecordId+"-"+chatItemId).attr('onclick',"chatDisCollect("+chatItemId+","+chatRecordId+","+userId+")");
      if(data.success){
        if(data.summary.host){
          $("#upSummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
            "<div class='summary-content'>" + data.summary.summary.chatContent +
            "</div>" +
            "<div class='summary-owner'>" +
            "<span class='ownerName'>"+data.summary.summary.user.name+
            "发表于</span>" +
            "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
            "</div>" +
            "</div>")
        }else{
          $("#mySummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
            "<div class='summary-content'>" + data.summary.summary.chatContent +
            "</div>" +
            "<div class='summary-owner'>" +
            "<span class='ownerName'>"+data.summary.summary.user.name+
            "发表于</span>" +
            "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
            "</div>" +
            "</div>")
        }
      }
    }
  })
}

/**
 * 取消收藏
 * @param chatItemId
 * @param chatRecordId
 * @param userId
 */
function chatDisCollect(chatItemId, chatRecordId, userId){
  var obj = {
    chatItemId: chatItemId,
    chatRecordId: chatRecordId,
    userId: userId,
    topicId: topicId
  };
  console.log('obj',obj)
  $.ajax({
    type:"POST",
    url:'/chat/discollect',
    data: obj,
    dataType: 'json',
    success: function (data) {
      if(data.success){
        console.log('取消收藏成功！',data);

        if(data.host){
          //话题主
          $("#upSummary div[data-chatid =" + chatItemId+"]").remove();
          $("#collect-"+chatRecordId+"-"+chatItemId).removeClass('fa-star').addClass('fa-star-o');
          $("#collect-"+chatRecordId+"-"+chatItemId).attr('onclick',"chatCollect("+chatItemId+","+chatRecordId+","+userId+")");
        }else{
          $("#mySummary div[data-chatid =" + chatItemId+"]").remove();
          $("#collect-"+chatRecordId+"-"+chatItemId).removeClass('fa-star').addClass('fa-star-o');
          $("#collect-"+chatRecordId+"-"+chatItemId).attr('onclick',"chatCollect("+chatItemId+","+chatRecordId+","+userId+")");
        }

      }
    }
  })
}

/**
 * 点击at信息，定位到该聊天item
 */
$('.at-item').click(function (e) {
  e.preventDefault();
  console.log($(this).children('span').data("chatid"))
});

/**
 * 收藏文件
 */
//$('.collectFile').click(function (e) {
//  //e.preventBubble()
//  e.stopPropagation()
//  var topicId = $("#Title").data('id');
//  var file_id = $(this).parent('.file-item').attr('id');
//  var fileobj = {
//    topicId:topicId,
//    file_id: file_id
//  };
//  console.log('fileObj', fileobj);
//  $.ajax({
//    url:'/chat/collect/file',
//    data:fileobj,
//    type:"POST",
//    dataType:'json',
//    success: function (data) {
//      if(data.success){
//        console.log(data);
//      }
//    }
//  })
//});

/**
 * 删除文件，只有话题主和上传的人可以删除
 */
$('.deleteFile').click(function(e){
  e.stopPropagation();
  var topicId = $("#Title").data('id');
  var file_id = $(this).parent('.file-item').attr('id');
  //文件上传者id
  var fileUperId = $(this).parent('.file-item').data("upuserid");
  //想删除文件的人的id
  var userId = $(".middle").data('userid');
  //话题主的id
  var topicOwnerId =$(".middle").data('ownerid');
  //检验是否有权限去删除
  if(userId == fileUperId || userId == topicOwnerId){
    //有权限
    var fileobj = {
      file_id: file_id,
      topicId:topicId
    };

    $.ajax({
      url:'/chat/delete/file',
      data: fileobj,
      type:"POST",
      dataType:'json',
      success: function(data){
        console.log('delete',data)
        if(data.success){
          swal("删除成功！")
          $('#'+file_id).remove();
          console.log(data)
        }
      }
    })
  }else{
    //无权限
    swal('您没有权限删除此文件')
  }


})
$(document).ready(function() {

  //邀请成员
  //$('#investMember').click(function (e) {
  //  e.preventDefault();
  //  var teamId = $("#investMember").data('teamid');
  //  $('.invest-code').append("<input value='http://localhost:8080/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'>")
  //
  //});



  $("#searchMember").click(function () {

  });

  $('.shade').children().click(function (e) {
    e.stopPropagation();
  });
  $('.shade').click(function (e) {
    $(this).hide();
  });

  $('.topic').click(function (e) {
    $('.summary-chat').remove();
  })

  $("#addNewTask").click(function (e) {
    $('.shade input').val("");
    $('.shade textarea').val("");
    $("#addTask").show();
  });

  //聊天里面的预览图片
  $('.chat-item img').click(function (e) {
    $("#filePreview").children('.box').html("");
    e.preventDefault();
    var src = $(this).attr("src");
    console.log(src)
    if(src){
      $("#filePreview").children('.box').prepend("<img src='"+src+"'>");
      $("#filePreview").show()
    }
  });
  $('.file-item').hover(function () {
    $(this).children('i').show();
  }, function () {
    $(this).children('i').hide()
  })

  $(".file-box").click(function (e) {
    console.log(e.target)
    if($(e.target).hasClass('file-item')){
      if($(e.target).data('filetype')==1){
        $("#filePreview").children('.box').html("");
        e.stopPropagation();
        $('#filePreview').children('.box').prepend("<img src='"+$(e.target).data('src')+"'>");
        $('#filePreview').show();
      }
    };
    if($(e.target).hasClass('collectFile')){
      console.log('收藏文件 ');
      e.stopPropagation();
      var file_id = $(e.target).parent().attr('id');
      var obj = {
        file_id: file_id,
        topicId: topicId
      }
      $.ajax({
        type: 'POST',
        url: '/topic/file/collect',
        data: obj,
        dataType: 'json',
        success: function (data) {
          if(data.success){
            console.log('收藏成功')
            $(e.target).removeClass('fa-star-o collectFile').addClass('fa-star cancelCollect');

          }
        }
      })
    }
    if($(e.target).hasClass('cancelCollect')){
      e.stopPropagation;
      var file_id = $(e.target).parent().attr('id');
      var obj = {
        file_id: file_id,
        topicId: topicId
      }
      $.ajax({
        type:'POST',
        url:'/topic/file/cancel',
        data: obj,
        dataType: 'json',
        success: function (data) {
          if(data.success){
            $(e.target).removeClass('fa-star cancelCollect').addClass('fa-star-o collectFile')
          }
        }
      })

    }
  })


  //事件委托到chatPart上面
  $('#chatPart').click(function (e) {
    if($(e.target).hasClass('chat-operate')){
      $(e.target).children('i').show();
    }
  });



  $('.chatItem').hover(function(){
    $(this).children('span').show()
    $(this).children('span').children('i').hide()
  }, function(){
    $(this).children('span').hide()
  });

  $('textarea').atwho({
    at: "@",
    data: "http://www.zhengxinsen.com/members/topic?topicId=" + $("#Title").data('id')
    //data: "http://localhost:8080/members/topic?topicId=" + $("#Title").data('id')
  });
  $("textarea").on("keydown.atwho", function (e, flag, query) {
    e.stopPropagation()
  });
  $('#chatPart').bind('mousewheel', function (e) {
    if(e.deltaY < 0){
      $("#tipChat").hide();
    }
    if($('#chatPart').scrollTop()==0){
      if($("#hasNoRecord").is(":visible") == false){
        $("#tipChat").show();
      }
    }
  });
  //加载更多历史聊天记录
  $("#tipChat").click(function (e) {
    $("#tipChat").removeAttr('onclick');
    var chatCount = $("#chatPart").children().length;
    var chatItemId = $("#chatPart").children().first().data('chatitemid');
    var chatRecordId = $("#chatPart").children().first().data('chatrecordid');
    var obj = {
      chatItemId: chatItemId,
      chatRecordId: chatRecordId,
      chatCount: chatCount,
      summary: false,
      up:true
    };
    $.ajax({
      type:"POST",
      url:"/mousewheel/chat",
      data: obj,
      dataType:'json',
      success: function (data) {
        console.log(data)
        if(data.success){
          console.log('history data',data);
          if(data.hisChat.length == 0){
            $("#hasNoRecord").show();
            $("#tipChat").hide()
          }else{
            data.hisChat.reverse().forEach(function (obj, i, arr) {
              if(obj.chat_type == 1){
                $("#chatPart").prepend(
                  "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                    "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                    "</div>" +
                  "<div class='chatItem'>" +obj.chatContent+
                  "<span class='fa fa-ellipsis-h chat-operate'>" +
                  "<i class='fa fa-thumbs-o-up'  onclick='chatAgree(" +obj.chatItemId+ ","+ obj.chatRecordId+")'></i>"+
                  "<i class='fa fa-star-o'  onclick='chatCollect(" +obj.chatItemId+ ","+ obj.chatRecordId+")'></i>"+
                  "</span>"+
                  "</div>"+
                  "</div>")
              }
              if(obj.chat_type == 2){
                $("#chatPart").prepend(
                  "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                  "<div class='userMsg'>" +
                  "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                  "<span class='name'>" + obj.user.name + "</span>" +
                  "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                  "</div>" +
                  "<div class='chatItem'>" +
                  "<img class='preview-img' src='"+ obj.chatContent +"'>"+
                  "<span class='fa fa-ellipsis-h chat-operate'>" +
                  "<i class='fa fa-thumbs-o-up'  onclick='chatAgree(" +obj.chatItemId+ ","+ obj.chatRecordId+")'></i>"+
                  "<i class='fa fa-star-o'  onclick='chatCollect(" +obj.chatItemId+ ","+ obj.chatRecordId+")'></i>"+
                  "</span>"+
                  "</div>"+
                  "</div>")
              }
              if(obj.chat_type == 3){
                $("#chatPart").prepend(
                  "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                  "<div class='userMsg'>" +
                  "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                  "<span class='name'>" + obj.user.name + "</span>" +
                  "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                  "</div>" +
                  "<div class='chatItem'>" +
                  "<a href='" +obj.chatContent +"'>点击下载</a>"+
                  "<span class='fa fa-ellipsis-h chat-operate'>" +
                  "<i class='fa fa-thumbs-o-up' onclick='chatAgree(" +obj.chatItemId+ ","+ obj.chatRecordId+")'></i>"+
                  "<i class='fa fa-star-o' onclick='chatCollect(" +obj.chatItemId+ ","+ obj.chatRecordId+")'></i>"+
                  "</span>"+
                  "</div>"+
                  "</div>")
              }
            })
          }

        }
      }
    })
  })
  $('.summary-chat').bind('mousewheel', function (e) {
    console.log(e.deltaY,$(".summary-chat").scrollTop())
    if($('.summary-chat').scrollTop()==0 && e.deltaY > 2500){
      var chatCount = $("#summaryChat").children().length;
      var chatItemId = $("#summaryChat").children().first().data("chatitemid");
      var chatRecordId = $("#summaryChat").children().first().data('chatrecordid');
      var obj = {
        chatItemId: chatItemId,
        chatRecordId: chatRecordId,
        chatCount: chatCount,
        summary: false,
        up: true
      };
      console.log(obj);
      $.ajax({
        type: 'POST',
        url:"/mousewheel/chat",
        data: obj,
        dataType: 'json',
        success: function (data) {
          if(data.success){
            console.log('data',data)
            data.hisChat.reverse().forEach(function(obj, i, arr){
              $("#summaryChat").prepend("<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                "<span>" + obj.user.name +
                "</span>" +
                "<div>" + obj.chatContent+
                "</div>" +
                "</div>")
            })
          }
        }
      })
    }
    if($('.summary-chat').scrollTop()==130 && e.deltaY < -2000){
      //希望加载更多该聊天记录的下面的内容，滚动鼠标的时候
      //TODO 添加一点样式提示
      var chatItemId = $("#summaryChat").children().last().data('chatitemid');
      var chatRecordId = $("#summaryChat").children().last().data('chatrecordid');
      var obj = {
        chatItemId: chatItemId,
        chatRecordId: chatRecordId,
        summary: false,
        up: false
      }
      console.log('obj',obj)
      $.ajax({
        type:"POST",
        url:"/mousewheel/chat",
        data: obj,
        dataType:'json',
        success: function(data){
          if(data.success){
            console.log(data)
            data.hisChat.forEach(function (obj, i, arr) {
              $("#summaryChat").append("<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+chatRecordId+"'>" +
                "<span>" + obj.user.name+
                "</span>" +
                "<div>" + obj.chatContent+
                "</div>" +
                "</div>")
            })
          }
        }
      })
    }
  });

  var topicId = $("#Title").data('id')
  console.log('topicId', topicId)
  $('#taskEndTime').dateRangePicker({
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
  //$('#summernote').summernote({
  //  height:200,
  //  minHeight:200,
  //  maxHeight:200,
  //  focus:true
  //});

  //发表聊天
  $("#chatSubmit").click(function (e) {
    var reg = /@(\w+)\b\s+/g;
    var atSome = reg.exec($("#chatContent").val());
    console.log("reg", atSome)
    e.preventDefault();
    var topicId = $("#Title").data("id");
    if($("#chatContent").val()==""){
      return
    }
    var chat = $("#chatContent").val();

    var obj = {
      chatContent: chat,
      topicId: topicId,
      chat_type: 1,
      at: atSome
    };
    e.returnValue = false;
    e.preventDefault();
    $("#chatContent").val("").focus();
    $.ajax({
      type:"POST",
      url:"/chat",
      data: obj,
      dataType:'json',
      success: function (data) {
        if(data.success){
          console.log('聊天',data)
          var chatItem = {};
          if(data.at){
            //有at说明肯定是文本信息
            socket.emit('sendNotification',data.user.userId, data.toUser.userId)
            chatItem = {
              chat_type: data.publicChat.chat_type,
              at: true,
              toUser: data.toUser,
              chatObj:{
                chatItemId: data.publicChat.chatItemId,
                chatContent: data.publicChat.chatContent,
                chatRecordId: data.chatRecordId,
                createAt: data.publicChat.createAt
              },
              user: data.user,
              topicId: topicId
            }
          }else{
            chatItem = {
              chat_type: data.publicChat.chat_type,
              at: false,
              chatObj:{
                chatItemId: data.publicChat.chatItemId,
                chatContent: data.publicChat.chatContent,
                chatRecordId: data.chatRecordId,
                createAt: data.publicChat.createAt
              },
              user: data.user,
              topicId: topicId
            }
          }
          socket.emit('public chat', chatItem);
        }
      }
    })
  });
  //$(document).keydown(function (event) {
  //  var topicId = $("#Title").data("id")
  //  var e = event || window.event;
  //  if(e && e.keyCode == 13){
  //    if($("#chatContent").val()==""){
  //      return
  //    }else{
  //      var chat = $("#chatContent").val();
  //      var obj = {
  //        chatContent: chat,
  //        topicId: topicId,
  //        chat_type: 1
  //      };
  //      e.returnValue = false;
  //      e.preventDefault();
  //      $("#chatContent").val("").focus();
  //      $.ajax({
  //        type:"POST",
  //        url:"/chat",
  //        data: obj,
  //        dataType:'json',
  //        success: function (data) {
  //          if(data.success){
  //            console.log('data',data)
  //            socket.emit('public chat', {user:data.user,chat: data.publicChat})
  //          }
  //        }
  //      })
  //    }
  //  }
  //
  //});

  //获取本团队下面的所有成员列表
  $("#membersSetting").click(function () {
    //console.log('check', $("#membersSetting").data("hostornot") == true)
    var userId = $('.middle').data('userid');
    var teamId = $("#memberSetting").data('teamid')
    var obj = {
      teamId: teamId,
      topicId: topicId,
      topic: true,
      task:false
    };
    $.ajax({
      type: "POST",
      url:"/members/team",
      data:obj,
      dataType:'json',
      success: function(data){
        if(data.success){
          console.log('data',data)
          $('#memberSetting').show();
          var existMembers=[],
            unexistMembers=[];
          data.teamMembers.forEach(function (obj, i, arr) {
            var j=0;
            for(j; j<data.topicMembers.length; j++){
             if(obj.userId==data.topicMembers[j].userId){
               existMembers.push(obj)
               break;
             }
            }
            console.log('j',j);
            if(j == data.topicMembers.length){
              unexistMembers.push(obj)
            }
          });
          //console.log('unexistMembers',unexistMembers)
          //console.log('existMembers',existMembers)
          $("#memberSetting .existed-member-list").html("")
          $("#memberSetting .unexisted-member-list").html("")
          if($("#membersSetting").data("hostornot") == true){
            //话题主点开的成员列表如何展示
            if(existMembers.length == 0){
              return $("#memberSetting .existed-member-list").prepend("<div>暂无成员</div>")
            }
            existMembers.forEach(function (obj, i, arr) {
              //渲染成员列表
              if(userId !== obj.userId){
                $("#memberSetting .existed-member-list").append("<div class='member-item' data-userid='" + obj.userId +"'>" +
                  "<img class='avatar' src='"+obj.avatar+"'>" +
                  "<span>" + obj.name +
                  "</span>" +
                  "<button class='manage-btn  del' data-userid='"+ obj.userId + "' onclick='deleteMember(" + topicId + "," + obj.userId + ")'>删除</button>" +
                  "</div>")
              }
            });
            $("#memberSetting .existed-member-list").append("<button class='m-btn' id='operate'>成员管理</button>")
            $("#memberSetting .existed-member-list").append("<button class='m-btn' id='investMember'>邀请加入</button>")
            $("#operate").click(function (e) {
              e.preventDefault();
              console.log('clicl')
              $(".manage-btn").show()
            });
            $('#investMember').click(function (e) {
              e.preventDefault();
              $(".unexisted-member-list").show();
            })
            if(unexistMembers.length==0){
              return $("#memberSetting .unexisted-member-list").prepend("<div class='tip'>本团队中的成员都在此话题中，可以通过链接邀请新成员</div>" +
                "<div class='invest-code'><input  value='http://www.zhengxinsen.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'></div>")
            }
            unexistMembers.forEach((function (obj, i, arr) {
              $("#memberSetting .unexisted-member-list").append("<div  class='member-item'>" +
                "<div class='userMsg'>" +
                "<img class='avatar' src='"+obj.avatar+"'>" +
                "<span>" + obj.name +
                "</span>" +
                "</div>" +
                "<button class='add' data-userid='"+ obj.userId + "' onclick='investToTopic(" + topicId + "," + obj.userId + ")'>邀请</button>" +
                "</div>")
            }));
            $("#memberSetting .unexisted-member-list").append("<div class='tip'>通过链接邀请新成员</div>" +
              "<div class='invest-code'><input  value='http://www.zhengxinsen.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'></div>")

          }else{
            //话题成员点开的成员列表
            existMembers.forEach(function (obj, i, arr) {
              $("#memberSetting .existed-member-list").append("<div  class='member-item' data-userid='"+obj.userId+"'>" +
                "<div class='usrMsg'>" +
                "<img class='avatar' src='"+obj.avatar+"'>" +
                "<span>" + obj.name +
                "</span>" +
                "</div>" +
                "</div>")
            });
            $("#memberSetting .existed-member-list").append("<button class='m-btn' id='investMember'>邀请加入</button>");
            $('#investMember').click(function (e) {
              e.preventDefault();
              $(".unexisted-member-list").show();
            })
            if(unexistMembers.length==0){
              return $("#memberSetting .unexisted-member-list").prepend("<div class='tip'>本团队中的成员都在此话题中，可以通过链接邀请新成员</div>" +
                "<div class='invest-code'><input  value='http://www.zhengxinsen.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'></div>")
            }

            unexistMembers.forEach(function (obj, i, arr) {
              $("#memberSetting .unexisted-member-list").append("<div  class='member-item'>" +
                "<div class='userMsg'>" +
                "<img class='avatar' src='"+obj.avatar+"'>" +
                "<span>" + obj.name +
                "</span>" +
                "</div>" +
                "<button class='add' data-userId='"+ obj.userId + "' onclick='investToTopic(" + topicId + "," + obj.userId + ")'>邀请</button>" +
                "</div>")
            })
            $("#memberSetting .unexisted-member-list").append("<div class='tip'>通过链接邀请新成员</div>" +
              "<div class='invest-code'><input  value='http://www.zhengxinsen.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'></div>")

          }



        }
      }
    })
  });




  //创建话题的子任务
  $("#newTask").click(function (e) {
    e.preventDefault();
    console.log($("#taskEndTime").val())
    var title = $("input[name='task-title']").val();
    var brief = $("textarea[name='task-content']").val();
    var endTime = $("#taskEndTime").val();
    var topicId = $("#Title").data("id");
    if(title == ""){
      return swal("标题不能为空")
    }
    if(brief==""){
      return swal("简述不能为空")
    }
    if(!moment().isBefore(endTime)|| endTime==""){
      return swal("请选择正确的时间")
    }
    var obj = {
      taskTitle: title,
      taskBrief: brief,
      endAt: endTime,
      hasTopic: true,
      topicId: topicId
    };
    $.ajax({
      type:"POST",
      url:"/create/task",
      data:obj,
      dataType:'json',
      success: function(data){
        if(data.success){
          console.log('hello');
          window.location.href = "/task?taskId="+ data.taskId
        }
      }
    })
  });


  //话题设置SHADE
  $("#setting").click(function (e) {
    $("#topicSetting").show();
  });
  //修改话题信息

  //set_type:
  //  1代表修改话题的基本信息
  //  2代表关闭话题
  //  3代表修改话题的成员
  $("#updateTopic").click(function (e) {
    e.preventDefault();
    var topicId = $("#Title").data("id");
    var title = $("input[name='topic-title']").val();
    var brief = $("textarea[name='topic-content']").val();
    var endAt = $("input[name='topic-endAt']").val();
    var obj = {
      topicId: topicId,
      title: title,
      brief: brief,
      endAt: endAt,
      set_type:1
    };
    $.ajax({
      type:"POST",
      data:obj,
      url: "/setting/topic",
      dataType:'json',
      success: function (data) {
        if(data.success){
          console.log(data)
        }
      }
    })
  });
  //关闭话题
  $("#closeTopic").click(function (e) {
    e.preventDefault();
    var topicId = $("#Title").data('id');
    var obj = {
      topicId: topicId,
      set_type: 2
    };
    $.ajax({
      type:"POST",
      data:obj,
      dataType: 'json',
      url:"/setting/topic",
      success: function (data){
        //console.log(data)
        if(data.success){
          //swal("话题已成功关闭")
          window.location.href="http://www.zhengxinsen.com/liao";

        }else{
          swal("话题关闭异常，请稍后再试")
        }
      }
    })
  });

  $('.summary').click(function (e) {
    //console.log('触发summary的click事件')
    $('.summary-chat').remove();

    var chatItemId = $(this).data('chatid');
    var chatRecordId = $(this).data('chatrecordid');
    var obj = {
      chatItemId: chatItemId,
      chatRecordId: chatRecordId,
      summary: true
    };
    var thisObj = $(this);
    $.ajax({
      url:"/mousewheel/chat",
      data: obj,
      type: 'POST',
      dataType: 'json',
      success: function (data) {
        if(data.success){
          if(data.summaryChat){
            var summarychat = data.summaryChat;
            var chatItemId = data.chatItemId;
            thisObj.after("<div class='summary-chat'><div id='summaryMoreChat'>更多聊天记录</div><div id='summaryMoreChatDown'>更多下面的聊天记录</div><div id='summaryChat'></div>" +
              "</div>");
            summarychat.forEach(function (obj, i, arr) {
              var tempClass = obj.chatItemId == chatItemId?"important":"normal";
              if(obj.chat_type == 1){
                $("#summaryChat").append("<div class="+tempClass+" data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                  "<div class='userMsg'>" +
                  "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                  "<span class='name'> " + obj.user.name +"</span>" +
                  "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                  "</div>" +
                  "<div class='chatItem'>" + obj.chatContent+
                  "</div>" +
                  "</div>")
              }
              if(obj.chat_type == 2){
                $("#summaryChat").append("<div class="+tempClass+" data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                  "<div class='userMsg'>" +
                  "<a class='avatar' href='#'><img src='" +obj.user.avatar+"' ></a>" +
                  "<span class='name'> " + obj.user.name +"</span>" +
                  "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                  "</div>" +
                  "<div class='chatItem'>"+"<img src='"+ obj.chatContent+"' class='preview-img'/>"+
                  "</div>" +
                  "</div>")
              }
              if(obj.chat_type == 3){
                $("#summaryChat").append("<div class="+tempClass+" data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                  "<div class='userMsg'>" +
                  "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                  "<span class='name'> " + obj.user.name +"</span>" +
                  "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                  "</div>" +
                  "<div class='chatItem'><a href='" + obj.chatContent+"'>点击下载</a> </div>" +
                  "</div>")
              }
            });
            $(".summary-chat").show();
            $('.summary-chat').click(function (e) {
              e.stopPropagation()
            })
            $('.summary-chat').children().click(function (e) {
              e.stopPropagation();
            });
            //显示更多聊天提示
            $('#summaryChat').bind('mousewheel', function (e) {
              if(e.deltaY < 0){
                $("#summaryMoreChat").hide();

              }
              if(e.deltaY > 0){
                $('#summaryMoreChatDown').hide()
              }
              if($('.summary-chat').scrollTop()==0){
                $("#summaryMoreChat").show();
                $("#summaryMoreChat").attr('onclick');
              }
              //TODO 这里的这个数字是会变的（因为样式的缘故）
              if($('.summary-chat').scrollTop() - $("#summaryChat")[0].scrollHeight + $(".summary-chat").height()<30){
                console.log('xiangdengle')
                $('#summaryMoreChatDown').show()
                $("#summaryMoreChatDown").attr('onclick');

              }
            });


            $('#summaryMoreChat').click(function (e) {
              console.log('click')
              $('#summaryMoreChat').removeAttr('onclick');
              var chatCount = $("#summaryChat").children().length;
              var chatItemId = $("#summaryChat").children().first().data("chatitemid");
              var chatRecordId = $("#summaryChat").children().first().data('chatrecordid');
              var obj = {
                chatItemId: chatItemId,
                chatRecordId: chatRecordId,
                chatCount: chatCount,
                summary: false,
                up: true
              };
              $.ajax({
                type: 'POST',
                url:"/mousewheel/chat",
                data: obj,
                dataType: 'json',
                success: function (data) {
                  if(data.success){
                    $('#summaryMoreChat').hide();
                    if(data.hisChat.length > 0){
                      data.hisChat.reverse().forEach(function(obj, i, arr){
                        if(obj.chat_type == 1){
                          $('#summaryChat').prepend("<div  data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                            "<div class='userMsg'>" +
                            "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                            "<span class='name'> " + obj.user.name +"</span>" +
                            "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                            "</div>" +
                            "<div class='chatItem'>" + obj.chatContent+
                            "</div>" +
                            "</div>")
                        }
                        if(obj.chat_type == 2){
                          $("#summaryChat").prepend("<div  data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                            "<div class='userMsg'>" +
                            "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                            "<span class='name'> " + obj.user.name +"</span>" +
                            "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                            "</div>" +
                            "<div class='chatItem'>"+"<img src='"+ obj.chatContent+"' class='preview-img'/>"+
                            "</div>" +
                            "</div>")
                        }
                        if(obj.chat_type == 3){
                          $("#summaryChat").prepend("<div  data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                            "<div class='userMsg'>" +
                            "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                            "<span class='name'> " + obj.user.name +"</span>" +
                            "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                            "</div>" +
                            "<div class='chatItem'><a href='" + obj.chatContent+"'>点击下载</a> </div>" +
                            "</div>")
                        }
                      })
                    }else{
                      $('#summaryMoreChat').html("没有更多的聊天记录了");
                      $("#summaryMoreChat").unbind()
                      //解除掉获得更多聊天记录的click事件，也就是再点不发请求了
                    }

                  }

                }
              })
            });
            $('#summaryMoreChatDown').click(function (e) {
              console.log('hahahaha');
              $('#summaryMoreChatDown').removeAttr('onclick');
              var chatItemId = $("#summaryChat").children().last().data("chatitemid");
              var chatRecordId = $("#summaryChat").children().first().data('chatrecordid');
              var obj = {
                chatItemId: chatItemId,
                chatRecordId: chatRecordId,
                summary: false,
                up: false
              };
              $.ajax({
                type:"POST",
                url:"/mousewheel/chat",
                data: obj,
                dataType:'json',
                success: function(data){
                  if(data.success){
                    $('#summaryMoreChatDown').hide();
                    if(data.hisChat.length > 0){
                      data.hisChat.forEach(function (obj, i, arr) {
                        if(obj.chat_type == 1){
                          $('#summaryChat').append("<div  data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                            "<div class='userMsg'>" +
                            "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                            "<span class='name'> " + obj.user.name +"</span>" +
                            "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                            "</div>" +
                            "<div class='chatItem'>" + obj.chatContent+
                            "</div>" +
                            "</div>")
                        }
                        if(obj.chat_type == 2){
                          $("#summaryChat").append("<div  data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                            "<div class='userMsg'>" +
                            "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                            "<span class='name'> " + obj.user.name +"</span>" +
                            "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                            "</div>" +
                            "<div class='chatItem'>"+"<img src='"+ obj.chatContent+"' class='preview-img'/>"+
                            "</div>" +
                            "</div>")
                        }
                        if(obj.chat_type == 3){
                          $("#summaryChat").append("<div  data-chatitemid='" + obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"'>" +
                            "<div class='userMsg'>" +
                            "<a class='avatar' href='#'><img src='" +obj.user.avatar+"'></a>" +
                            "<span class='name'> " + obj.user.name +"</span>" +
                            "<span class='time'>"+ moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') +"</span>" +
                            "</div>" +
                            "<div class='chatItem'><a href='" + obj.chatContent+"'>点击下载</a> </div>" +
                            "</div>")
                        }
                      })
                    }else{
                      $("#summaryMoreChatDown").html("已经是最新的记录了")
                      $("#summaryMoreChatDown").unbind()
                    }
                  }
                }
              })
            });
          }
        }
      }
    })
  })

});


//点击摘要或者收藏显示上下文

