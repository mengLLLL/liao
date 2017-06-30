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
          "</div>" +
          "<span class=' chat-operate'>" +
          "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
          "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect(1,"+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
          "</span>"+
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
          "</div>" +
          "<span class='chat-operate'>" +
          "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
          "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect(1,"+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
          "</span>"+
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
        "</div>" +
        "<span class=' chat-operate'>" +
        "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
        "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect(1,"+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
        "</span>"+
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
        "<div class='chatItem'>" +"<img class='preview-img' src='"+data.chatObj.chatContent+"'>" +
        "<span class='file-name'>"+data.chatObj.fileName+"</span>"+
        "</div>" +
        "<span class='chat-operate'>" +
        "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
        "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect(2,"+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
        "</span>"+
        "</div>");

      $("#topicFileCenter .file-box").append("<div id='"+data.file_id+"' data-src='"+data.chatObj.chatContent+"' data-filetype='1' data-upuserid='"+data.user.userId+"' data-upusername='"+data.user.userName+"' class='file-item'>" + data.chatObj.fileName +
        "<i class='fa fa-star-o collectFile'></i>"+
        "<i class='fa fa-trash' deleteFile></i>"+
        "</div>")
    }else{
      //不可以预览,不等于2那就肯定等于3了
      $("#chatPart").append("<div class='chat-item' data-chatitemid='"+data.chatObj.chatItemId+"' data-chatrecordid='"+data.chatObj.chatRecordId+"'>" +
        "<div class='userMsg'>" +
        "<a href='#' class='avatar'><img src='"+data.user.avatar+"'>" +
        "</a>" +
        "<span class='name'>"+data.user.userName+"</span>" +
        "<span class='time'>"+moment(data.chatObj.createAt).format('YYYY.MM.DD HH:MM:SS')+"</span>" +
        "</div>" +
        "<div class='chatItem'><i class='fa fa-file'></i>" +"<a href='"+data.chatObj.chatContent+"'>"+data.chatObj.fileName+"</a>"+
        "</div>" +
        "<span class=' chat-operate'>" +
        "<i class='fa fa-thumbs-o-up' id='agree-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatAgree("+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")' ></i>" +
        "<i class='fa fa-star-o' id='collect-"+data.chatObj.chatRecordId+"-"+data.chatObj.chatItemId+"' onclick='chatCollect(3,"+data.chatObj.chatItemId+","+data.chatObj.chatRecordId+","+userId+")'></i>" +
        "</span>"+
        "</div>")
      $("#topicFileCenter .file-box").append("<div id='"+data.file_id+"' data-src='"+data.chatObj.chatContent+"' data-filetype='2' data-upuserid='"+data.user.userId+"' data-upusername='"+data.user.userName+"' class='file-item'>" + "<a href='"+data.chatObj.chatContent+"'>"+data.chatObj.fileName + "下载</a>"+
        "<i class='fa fa-star-o collectFile'></i>"+
        "<i class='fa fa-trash' deleteFile></i>"+
        "</div>")



    }

  }
  $('.center-box').scrollTop($('#chatPart')[0].scrollHeight)



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
        $('#memberSetting').hide();

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
        $('#memberSetting').hide();

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
  console.log('clclcllcage')
  var obj = {
    chatItemId: chatItemId,
    userId: userId,
    chatRecordId: chatRecordId
  };
  console.log('boh',obj)
  $.ajax({
    type:"POST",
    url:"/chat/agree",
    data:obj,
    dataType:'json',
    success:function(data){
      if(data.success){
        console.log('$("#agree-"+chatRecordId+"-"+chatItemId)',$("#agree-"+chatRecordId+"-"+chatItemId))
        console.log('data',$("#agree-"+chatRecordId+"-"+chatItemId).children().length)
        if($("#agree-"+chatRecordId+"-"+chatItemId).children().length > 0){
          $("#agree-"+chatRecordId+"-"+chatItemId).children().html("("+data.agree_sum+")");
        }else{
          $("#agree-"+chatRecordId+"-"+chatItemId).append("<span class='collect-sum'>("+data.agree_sum+")</span>")
        }
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
        if(data.agree_sum == 0){
          $("#agree-"+chatRecordId+"-"+chatItemId).children().html("");
        }else{
          $("#agree-"+chatRecordId+"-"+chatItemId).children().html("("+data.agree_sum+")");
        }
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
function chatCollect(chatType,chatItemId,chatRecordId,userId){
  var filename = "";
  if(chatType == 2 || chatType == 3){
    filename=$("#collect-"+chatRecordId+"-"+chatItemId).parent().siblings('.file-name').html();
  }
  var topicId = $("#Title").data('id');
  var obj = {
    chatItemId:chatItemId,
    chatRecordId: chatRecordId,
    chatType: chatType,
    userId: userId,
    topicId: topicId,
    fileName: filename
  };
  $.ajax({
    type:"POST",
    url:"/chat/collect",
    data:obj,
    dataType:'json',
    success: function (data) {
      console.log('data',data)
      $("#collect-"+chatRecordId+"-"+chatItemId).removeClass('fa-star-o').addClass('fa-star');
      $("#collect-"+chatRecordId+"-"+chatItemId).attr('onclick',"chatDisCollect("+chatType+","+chatItemId+","+chatRecordId+","+userId+")");
      if(data.success){
        if(data.summary.host){
          //话题主的收藏展现
          if(data.summary.summary.chat_type == 1){
            if(data.summary.summary.chatContent.length > 20){
              $("#upSummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
                "<div class='summary-content' data-toggle='tooltip' title='"+data.summary.summary.chatContent+"' data-placement='bottom'>" + data.summary.summary.chatContent.substr(0,20) +
                "...</div>" +
                "<div class='summary-owner'>" +
                "<span class='ownerName'>" + data.chatItemOwner.nickName +
                "发表于</span>" +
                "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
                "</div>" +
                "</div>")
            }else{
              $("#upSummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
                "<div class='summary-content'>" + data.summary.summary.chatContent +
                "</div>" +
                "<div class='summary-owner'>" +
                "<span class='ownerName'>" + data.chatItemOwner.nickName +
                "发表于</span>" +
                "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
                "</div>" +
                "</div>")
            }

          }
          if(data.summary.summary.chat_type == 2){
            $("#upSummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
              "<div class='summary-content'>" +
              "<img src='"+data.summary.summary.chatContent+"'>" +
              "<span>" + data.summary.summary.fileName+ "</span>"+
              "</div>" +
              "<div class='summary-owner'>" +
              "<span class='ownerName'>"+ data.chatItemOwner.nickName +
              "发表于</span>" +
              "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
              "</div>" +
              "</div>")
          }
          if(data.summary.summary.chat_type == 3){
            $("#upSummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
              "<div class='summary-content'>" +
              "<a href='"+data.summary.summary.chatContent+"'>" + data.summary.summary.fileName + "</a>" +
              "</div>" +
              "<div class='summary-owner'>" +
              "<span class='ownerName'>"+ data.chatItemOwner.nickName +
              "发表于</span>" +
              "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
              "</div>" +
              "</div>")
          }

        }else{
          if(data.summary.summary.chat_type == 1){
            if(data.summary.summary.chatContent.length > 20) {
              $("#mySummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
                "<div class='summary-content' data-toggle='tooltip' title='"+data.summary.summary.chatContent+"' data-placement='bottom'>" + data.summary.summary.chatContent.substr(0,20) +
                "</div>" +
                "<div class='summary-owner'>" +
                "<span class='ownerName'>"+ data.chatItemOwner.nickName +
                "发表于</span>" +
                "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
                "</div>" +
                "</div>")
            }else{
              $("#mySummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
                "<div class='summary-content'>" + data.summary.summary.chatContent +
                "</div>" +
                "<div class='summary-owner'>" +
                "<span class='ownerName'>"+ data.chatItemOwner.nickName +
                "发表于</span>" +
                "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
                "</div>" +
                "</div>")
            }
          }
          if(data.summary.summary.chat_type == 2){
            $("#mySummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
              "<div class='summary-content'>" +
              "<img src='"+data.summary.summary.chatContent+"'>" +
              "<span>" + data.summary.summary.fileName+ "</span>"+
              "</div>" +
              "<div class='summary-owner'>" +
              "<span class='ownerName'>"+ data.chatItemOwner.nickName +
              "发表于</span>" +
              "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
              "</div>" +
              "</div>")
          }
          if(data.summary.summary.chat_type == 3){
            $("#mySummary .summary-box").append("<div class='host-summary summary' data-chatid='"+ chatItemId +"' data-chatrecordid='"+chatRecordId+"'>" +
              "<div class='summary-content'>" +
              "<a href='"+data.summary.summary.chatContent+"'>" + data.summary.summary.fileName + "</a>" +
              "</div>" +
              "<div class='summary-owner'>" +
              "<span class='ownerName'>"+ data.chatItemOwner.nickName +
              "发表于</span>" +
              "<span class='summary-publish-time'>"+moment(data.summary.summary.createAt).format('YYYY.MM.DD')+"</span>" +
              "</div>" +
              "</div>")
          }
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
function chatDisCollect(chatType,chatItemId, chatRecordId, userId){
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
          $("#collect-"+chatRecordId+"-"+chatItemId).attr('onclick',"chatCollect("+chatType+","+chatItemId+","+chatRecordId+","+userId+")");
        }else{
          $("#mySummary div[data-chatid =" + chatItemId+"]").remove();
          $("#collect-"+chatRecordId+"-"+chatItemId).removeClass('fa-star').addClass('fa-star-o');
          $("#collect-"+chatRecordId+"-"+chatItemId).attr('onclick',"chatCollect("+chatType+","+chatItemId+","+chatRecordId+","+userId+")");
        }

      }
    }
  })
}


function chatReply(thisObj,chatType, chatItemId, chatRecordId, r_userId, userId){

  var nickName = $('#topic').data('nickname');
  var topicTitle = $('.topic-title').html();
  console.log('tht', chatContent)
  var replyContent = $(thisObj).siblings('.reply-content').val();
  if(replyContent == ""){
    return swal("输入不能为空")
  }
  var obj = {
    chatItemId: chatItemId,
    chatRecordId: chatRecordId,
    chatType: chatType,
    userId: userId,
    topicId: topicId,
    r_userId: r_userId,
    replyContent: replyContent,
    topicTitle: topicTitle
  }
  $.ajax({
    type:'POST',
    url:'/chat/reply',
    data: obj,
    dataType: 'json',
    success: function (data) {
      if(data.success){
        console.log('success')
        $(thisObj).parent().hide();
        $(thisObj).parent().siblings('.replys-box').append("<div class='reply-item'><div class='content'>" +
          "<span>"+ replyContent+"</span>" +
          "<span class='user-name'>:"+ nickName+"</span>" +
          "<div class='time'>" + moment().format('YYYY.MM.DD HH:MM')+
          "</div>" +
          "</div>" +
          "</div>")
        socket.emit('sendNotification',userId, r_userId)

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
  $('.shade').children().click(function (e) {
    e.stopPropagation();
  });
  $('.shade').click(function (e) {
    $(this).hide();
  });

  $('.topic').click(function (e) {
    $('.summary-chat').remove();
  });

  //表格的相关操作
  var t = $("#editTable").DataTable({
  "columns":[
    {"data": null,"title":"1","defaultContent":""},
    {"data": null,"title":"2","defaultContent":""},
    {"data": null,"title":"3","defaultContent":""},
    {"data": null,"title":"4","defaultContent":""},
    {"data": null,"title":"操作","defaultContent":"<button class='edit-btn' type='button'>编辑</button><button class='save-btn' type='button' style='display: none" +
    ";'>保存</button>"}
  ],
    "language": {
    "sProcessing": "处理中...",
      "sLengthMenu": "显示 _MENU_ 项结果",
      "sZeroRecords": "没有匹配结果",
      "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
      "sInfoPostFix": "",
      "sSearch": "搜索:",
      "sUrl": "",
      "sEmptyTable": "表中数据为空",
      "sLoadingRecords": "载入中...",
      "sInfoThousands": ",",
      "oPaginate": {
      "sFirst": "首页",
        "sPrevious": "上页",
        "sNext": "下页",
        "sLast": "末页"
    },
    "oAria": {
      "sSortAscending": ": 以升序排列此列",
        "sSortDescending": ": 以降序排列此列"
    }
  }
});
  $('.addTable').click(function(e){
    //清空这个表是放在shade收回还是出现的时候再思考一下
    $('#addRow').on( 'click', function () {
      t.row.add([
        "1",
        "2",
        "3",
        "4",
        "5"
      ]).draw();
    } );
    $('#addRow').click();
    $("#onlineTable").show();
  });

  $("#editTable").click(function(e){
    if($(e.target).hasClass('edit-btn')){
      e.preventDefault()
      var tds=$(e.target).parents("tr").children();
      $.each(tds, function(i,val){
        var jqob=$(val);
        if(jqob.has('button').length ){return true;}
        var txt=jqob.text();
        var put=$("<input type='text'>");
        put.val(txt);
        jqob.html(put);
      });
      $(e.target).html("保存");
      $(e.target).hide();
      $(e.target).next().show();
      //e.stopPropagation()
    }
    if($(e.target).hasClass('save-btn')){
      var row = $(e.target).parents("tr");
      console.log('row',row)
      var tds = $(e.target).parents("tr").children();
      $.each(tds, function(i, item){
        //console.log('$(item)',$(item))
        console.log('item',item);
        if(!$(item).has('button').length){
          //console.log('$(item))', $(item)[0])
          //console.log('data',t.cell($(item)[0]).data())
          var txt = $(item).children("input").val();
          console.log('txt',txt)
          //$(item).html(txt);
          $("#editTable").DataTable().cell($(item)).data('ddd')
        }
      })
      console.log('data', t.data());
    }

  })

  $("#addNewTask").click(function (e) {
    $('.shade input').val("");
    $('.shade textarea').val("");
    $("#addTask").show();
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
        var fileName = $(e.target).children('.file-name').html();
        e.stopPropagation();
        $("#filePreview").children('.box').prepend('<img src="'+$(e.target).data('src')+'"><span class="name">'+fileName +'</span>');
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
    if($(e.target).hasClass('preview-img')){
      $("#filePreview").children('.box').html("");
      var src = $(e.target).attr("src");
      var fileName = $(e.target).next('span').html();
      console.log(src)
      if(src){
        $("#filePreview").children('.box').prepend("<img src='"+src+"'>");
        $("#filePreview").children('.box').append("<span class='name'>"+fileName + "</span>")
        $("#filePreview").show()
      }
    }
    if($(e.target).hasClass('reply')){
      $(e.target).parent().siblings('.reply-box').children('textarea').val("");
      $(e.target).parent().siblings('.reply-box').show();
    }
    if($(e.target).hasClass('cancel-reply')){
      e.preventDefault();
      $(e.target).parent().hide();
    }



  });

//聊天里面的预览图片
  $('.chat-item .preview-img').click(function (e) {
    $("#filePreview").children('.box').html("");
    e.preventDefault();
    var src = $(this).attr("src");
    console.log(src)
    if(src){
      $("#filePreview").children('.box').prepend("<img src='"+src+"'>");
      $("#filePreview").show()
    }
  });


  $('#chatContent').atwho({
    at: "@",
    // data: "http://pai.ihangwei.com/members/topic?topicId=" + $("#Title").data('id')
    data: "http://localhost:9000/members/topic?topicId=" + $("#Title").data('id')
  });

  $('#chatPart').bind('mousewheel', function (e) {
    if(e.deltaY < 0){
      if($("#hasNoRecord").is(":visible") == true){
        $("#hasNoRecord").hide();
      }
      if($("#tipChat").is(":visible") == true){
        $("#tipChat").hide();
      }
    }
    if(e.deltaY > 0 && $('#chatPart').scrollTop()==0){
      if($("#hasNoRecord").is(":visible") == false){
        $("#tipChat").show();
      }
    }
  });
  //加载更多历史聊天记录
  $("#tipChat").click(function (e) {
    console.log('click')
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
          //console.log('history data',data);
          if(data.hisChat.length == 0){
            $("#hasNoRecord").show();
            $("#tipChat").remove()
          }else{
            data.hisChat.reverse().forEach(function (obj, i, arr) {
              if(obj.chat_type == 1){
                //console.log('obj',obj)
                if(obj.agree.length > 0){
                  if(obj.reply.length > 0){
                    //有点赞并且有回复
                    var loopStr = "";
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    obj.reply.forEach(function (obj, i, arr) {
                      loopStr+="<div class='reply-item'><div class='content'>" +
                        "<span>" + obj.replyContent +
                        "</span>" +
                        "<span class='user-name'>:"+obj.user.name+"</span>" +
                        "<div class='time'>" + moment(obj.createAt).format('YYYY.MM.DD') +"</div>" +
                        "</div></div>"
                    })
                    var str = "<div class='replys-box'>"+loopStr+"</div>";
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +obj.chatContent+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass +"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+ agreeClick+"'><span class='collect-sum'>("+obj.agree.length+")</span></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"'  onclick='"+collectClick+"' ></i>" +
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+str+
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }else{
                    //有点赞没有回复

                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }

                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +obj.chatContent+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick +"'><span class='collect-sum'>("+obj.agree.length+")</span></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+
                      "<div class='replys-box'></div>" +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }
                }else{
                  //没有点赞有回复
                  if(obj.reply.length > 0){
                    console.log('has reply',obj.reply)
                    var loopStr = "";
                    obj.reply.forEach(function (obj, i, arr) {
                      loopStr+="<div class='reply-item'><div class='content'>" +
                        "<span>" + obj.replyContent +
                        "</span>" +
                        "<span class='user-name'>:"+obj.user.name+"</span>" +
                        "<div class='time'>" + moment(obj.createAt).format('YYYY.MM.DD') +"</div>" +
                        "</div></div>"
                    });
                    var str = "<div class='replys-box'>"+loopStr+"</div>";
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }

                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +obj.chatContent+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+str+
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }else{
                    //没有点赞没有回复
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +obj.chatContent+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+
                      "<div class='replys-box'></div>" +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }
                }

              }
              if(obj.chat_type == 2){
                if(obj.agree.length > 0){
                  if(obj.reply.length > 0){
                    console.log('img obj',obj)
                    var loopStr = "";
                    obj.reply.forEach(function (obj, i, arr) {
                      loopStr+="<div class='reply-item'><div class='content'>" +
                        "<span>" + obj.replyContent +
                        "</span>" +
                        "<span class='user-name'>:"+obj.user.name+"</span>" +
                        "<div class='time'>" + moment(obj.createAt).format('YYYY.MM.DD') +"</div>" +
                        "</div></div>"
                    });
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    var str = "<div class='replys-box'>"+loopStr+"</div>";
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<img class='preview-img' src='"+ obj.chatContent +"'>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'><span class='collect-sum'>("+obj.agree.length+")</span></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+ str+
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }else{
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<img class='preview-img' src='"+ obj.chatContent +"'>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'><span class='collect-sum'>("+obj.agree.length+")</span></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"'  onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+
                      "<div class='replys-box'></div>" +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }
                }else{
                  if(obj.reply.length > 0){
                    var loopStr = "";
                    obj.reply.forEach(function (obj, i, arr) {
                      loopStr+="<div class='reply-item'><div class='content'>" +
                        "<span>" + obj.replyContent +
                        "</span>" +
                        "<span class='user-name'>:"+obj.user.name+"</span>" +
                        "<div class='time'>" + moment(obj.createAt).format('YYYY.MM.DD') +"</div>" +
                        "</div></div>"
                    })
                    var str = "<div class='replys-box'>"+loopStr+"</div>";
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<img class='preview-img' src='"+ obj.chatContent +"'>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+ str+
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }else{
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<img class='preview-img' src='"+ obj.chatContent +"'>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "<i class='fa fa-reply reply' data-toggle='tooltip' title='回复' data-placement='top'></i>"+
                      "</span>"+
                      "<div class='replys-box'></div>" +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }
                }
              }
              if(obj.chat_type == 3){
                if(obj.agree.length > 0){
                  if(obj.reply.length > 0){
                    var loopStr = "";
                    obj.reply.forEach(function (obj, i, arr) {
                      loopStr+="<div class='reply-item'><div class='content'>" +
                        "<span>" + obj.replyContent +
                        "</span>" +
                        "<span class='user-name'>:"+obj.user.name+"</span>" +
                        "<div class='time'>" + moment(obj.createAt).format('YYYY.MM.DD') +"</div>" +
                        "</div></div>"
                    })
                    var str = "<div class='replys-box'>"+loopStr+"</div>";
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<a href='" +obj.chatContent +"'>点击下载</a>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'><span class='collect-sum'>("+obj.agree.length+")</span></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "</span>"+ str +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }else{
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<a href='" +obj.chatContent +"'>点击下载</a>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'><span class='collect-sum'>("+obj.agree.length+")</span></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "</span>"+
                      "<div class='replys-box'></div>" +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+data.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }
                }else{
                  if(obj.reply.length > 0){
                    var loopStr = "";
                    obj.reply.forEach(function (obj, i, arr) {
                      loopStr+="<div class='reply-item'><div class='content'>" +
                        "<span>" + obj.replyContent +
                        "</span>" +
                        "<span class='user-name'>:"+obj.user.name+"</span>" +
                        "<div class='time'>" + moment(obj.createAt).format('YYYY.MM.DD') +"</div>" +
                        "</div></div>"
                    })
                    var str = "<div class='replys-box'>"+loopStr+"</div>";

                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<a href='" +obj.chatContent +"'>点击下载</a>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "</span>"+ str +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }else{
                    var agreeClass;
                    var collectClass;
                    var collectClick = "chatCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                    var agreeClick = "chatAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";

                    for(var j = 0; j < obj.agree.length; j++){
                      if(obj.agree[j].user.id == userId){
                        agreeClass = 'fa fa-thumbs-up';
                        agreeClick = "chatDisAgree("+obj.chatItemId+","+chatRecordId+","+userId+")";
                        break;
                      }
                    }
                    for(var m = 0; m < obj.collect.length; m++){
                      if(obj.collect[m].user.id == userId){
                        collectClass = 'fa fa-star';
                        collectClick = "chatDisCollect(1,"+obj.chatItemId+","+chatRecordId+","+ userId+")";
                      }
                    }
                    if(j == obj.agree.length){
                      agreeClass = 'fa fa-thumbs-o-up'
                    }
                    if(m == obj.collect.length){
                      collectClass = 'fa fa-star-o'
                    }
                    $("#chatPart").prepend(
                      "<div data-chatitemid='"+obj.chatItemId+"' data-chatrecordid='"+data.chatRecordId+"' class='chat-item'>" +
                      "<div class='userMsg'>" +
                      "<a href='#' class='avatar'><img src='" + obj.user.avatar +"'></a>" +
                      "<span class='name'>" + obj.user.name + "</span>" +
                      "<span class='time'>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS') + "</span>" +
                      "</div>" +
                      "<div class='chatItem'>" +
                      "<a href='" +obj.chatContent +"'>点击下载</a>"+
                      "</div>"+
                      "<span class='chat-operate'>" +
                      "<i class='"+agreeClass+"' id='agree-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+agreeClick+"'></i>"+
                      "<i class='"+collectClass+"' id='collect-"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='"+collectClick+"'></i>"+
                      "</span>"+
                      "<div class='replys-box'></div>" +
                      "<div class='reply-box'>" +
                      "<textarea class='reply-content'></textarea>" +
                      "<button class='reply-confirm m-btn reply-btn' id='reply-'"+data.chatRecordId+"-"+obj.chatItemId+"' onclick='chatReply(this,1,"+obj.chatItemId+","+data.chatRecordId+","+obj.user.id+"," +userId +")'>回复</button>" +
                      "<button class='cancel-reply m-btn reply-btn'>取消</button>" +
                      "</div>"+
                      "</div>")
                  }
                }
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

  //发表聊天,通过点击发送键
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

  $(document).on('keydown', ' textarea', function(e) {
    if(e.keyCode == 13 && (e.metaKey || e.ctrlKey)) {
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
    }
  })


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

          $("#memberSetting .existed-member-list").html("")
          $("#memberSetting .unexisted-member-list").html("")
          $("#memberSetting .operate-part").html("")
          $('#memberSetting').show();

          console.log('data',data)
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
            if(j == data.topicMembers.length){
              unexistMembers.push(obj)
            }
          });

          if($("#membersSetting").data("hostornot") == true){
            //话题主点开的成员列表如何展示
            if(existMembers.length == 1){
              $("#memberSetting .existed-member-list").prepend("<div>暂无成员</div>")
              $("#memberSetting .operate-part").append("<button class='m-btn' id='investMember'>邀请加入</button>")

            }else{
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
              $("#memberSetting .operate-part").append("<button class='m-btn' id='investMember'>邀请加入</button>")
              $("#memberSetting .operate-part").append("<button class='m-btn' id='operate'>成员管理</button>")

            }
            if(unexistMembers.length==0){
              console.log('if')
              $("#memberSetting .unexisted-member-list").append("<div class='tip'>通过链接邀请新成员</div>" +
                "<div class='invest-code'>" +
                "<input id='investCode' value='http://pai.ihangwei.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'>" +
                "</div>" +
                "<div class='copy-part'><button class='m-btn' id='copyInvestCode' data-clipboard-target='investCode'>点击复制链接</button></div>")
            }else{
              console.log('else')
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
                "<div class='invest-code'>" +
                "<input id='investCode' value='http://pai.ihangwei.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'>" +
                "</div>" +
                "<div class='copy-part'><button class='m-btn' id='copyInvestCode' data-clipboard-target='investCode'>点击复制链接</button></div>")

            }
            $("#operate").click(function (e) {
              e.preventDefault();
              $(".manage-btn").show()
            });
            $('#investMember').click(function (e) {
              e.preventDefault();
              $(".unexisted-member-list").show();
            })

          }else{
            //话题成员点开的成员列表
            $("#memberSetting .operate-part").append("<button class='m-btn' id='investMember'>邀请加入</button>")
            existMembers.forEach(function (obj, i, arr) {
              $("#memberSetting .existed-member-list").append("<div  class='member-item' data-userid='"+obj.userId+"'>" +
                "<div class='usrMsg'>" +
                "<img class='avatar' src='"+obj.avatar+"'>" +
                "<span>" + obj.name +
                "</span>" +
                "</div>" +
                "</div>")
            });
            $('#investMember').click(function (e) {
              e.preventDefault();
              $(".unexisted-member-list").show();
            })
            if(unexistMembers.length==0){
              $("#memberSetting .unexisted-member-list").append("<div class='tip'>通过链接邀请新成员</div>" +
                "<div class='invest-code'>" +
                "<input id='investCode' value='http://pai.ihangwei.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'>" +
                "</div>" +
                "<div class='copy-part'><button class='m-btn' id='copyInvestCode' data-clipboard-target='investCode'>点击复制链接</button></div>")
            }else{
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
                "<div class='invest-code'>" +
                "<input id='investCode' value='http://pai.ihangwei.com/invest?tag=1&teamId="+teamId+"&userId="+userId+"&topicId="+topicId+"'>" +
                "</div>" +
                "<div class='copy-part'><button class='m-btn' id='copyInvestCode' data-clipboard-target='investCode'>点击复制链接</button></div>")
            }

          }

          var client = new ZeroClipboard($("#copyInvestCode"));
          client.on('aftercopy', function (e) {
            //e.preventDefault();
            swal('复制成功，去粘贴')
          })
          //client.on('ready', function(e){
          //  e.preventDefault();
          //  client.on('copy', function (event) {
          //    event.clipboardData.setData('text/plain', $("#investCode").val())
          //  })
          //  client.on('aftercopy', function(event){
          //    swal('复制成功')
          //  })
          //})

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
          window.location.href="/liao";

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
          console.log('data',data)
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
                  "<div class='chatItem'><a href='" + obj.chatContent+"'>"+obj.fileName+"</a> </div>" +
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
              if($('.summary-chat').scrollTop()==0){
                $("#summaryMoreChat").show();
                $("#summaryMoreChat").attr('onclick');
              }
              //TODO 这里的这个数字是会变的（因为样式的缘故）
              if($("#summaryChat")[0].scrollHeight - $('.summary-chat').scrollTop() == $(".summary-chat").height()-15){
                console.log('xiangdengle')
                $('#summaryMoreChatDown').show()
                $("#summaryMoreChatDown").attr('onclick');
              }

              if(e.deltaY < 0){
                $("#summaryMoreChat").hide();
              }
              if(e.deltaY > 0){
                $('#summaryMoreChatDown').hide()
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
                            "<div class='chatItem'><a href='" + obj.chatContent+"'>"+obj.fileName+"</a> </div>" +
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
                            "<div class='chatItem'><a href='" + obj.chatContent+"'>"+obj.fileName+"</a> </div>" +
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

