/**
 * Created by MengL on 2017/2/9.
 */
$(function () {
  //修改按钮
  $('.edit-btn').click(function (e) {
    e.preventDefault();
    $(this).hide();
    $(this).siblings().show();
    $(this).parent().siblings().children('input').attr('readOnly',false)
    $(this).parent().siblings().children().first().focus();
  });

  //确认修改用户信息
  $('.editConfirmUser').click(function (e) {
    var thisObj = $(this);

    e.preventDefault();
    var nickName =$("input[name='nickName']").val();
    var realName = $("input[name='realName']").val();
    var wechat = $("input[name='wechat']").val();
    var phoneNumber = $("input[name='phoneNumber']").val();
    var email = $("input[name='email']").val();
    var userId = $(this).data('userid')
    if(nickName == ""){
      return swal("用户名不能为空")
    }
    //if(password.length < 6 || password == ""){
    //  return swal("密码不能少于6位")
    //}
    var dataObj = {
      nickName: nickName,
      realName: realName,
      email: email,
      wechat: wechat,
      phoneNumber: phoneNumber,
      userId: userId
    }
    $.ajax({
      url:"/admin/edit/user",
      type: "POST",
      data: dataObj,
      dataType: 'json',
      success: function (data) {
        if(data.success){
          thisObj.hide();
          thisObj.parent().siblings().children('input').attr('readOnly',true)
          thisObj.siblings().show();
          swal('修改成功')
        }else{
          thisObj.hide();
          thisObj.parent().siblings().children('input').attr('readOnly',true)
          thisObj.siblings().show();
          swal(data.errMsg)
        }
      }
    })

  })

  //确认修改团队信息
  $(".editConfirmTeam").click(function (e) {
    e.preventDefault();
    var thisObj = $(this);
    var name = $("input[name='teamName']").val();
    var managerNickname = $("input[name='nickName']").val();
    var teamId = $(this).data('teamid');
    if(name == ""){
      return swal("团队名称不能为空")
    }
    if(managerNickname == ""){
      return swal("管理员不能为空")
    }
    var dataObj = {
      name: name,
      manager: managerNickname,
      teamId: teamId
    }
    console.log('dataobj', dataObj)
    $.ajax({
      url:"/admin/edit/team",
      type: 'POST',
      data: dataObj,
      dataType: 'json',
      success: function (data) {
        console.log('data',data)
        if(data.success){
          window.location.reload();
        }else{
          thisObj.hide();
          thisObj.parent().siblings().children('input').attr('readOnly',true)
          thisObj.siblings().show();
          swal(data.errMsg)
          window.location.reload();

        }
      }
    })
  })

  //获取用户详细信息
  $('.getUser').click(function (e) {
    e.preventDefault();
    var userId = $(this).data('userid');
    var dataObj = {
      userId: userId
    }
    $.ajax({
      type: 'POST',
      url: '/admin/usermsg',
      data: dataObj,
      success: function (data) {
        if(data.success){
          console.log('data user', data)
          $("#userBasicMsg").html("");
          $("#topicMsg").html("");
          $('.part').removeClass('show');
          $('#2').addClass('show');
          $('#userBasicMsg').append(
            "<div class='item'><img class='avatar' src='"+data.user.userObj.avatar+"' />" +
            "</div>"+
            "<div class='item'>" +
            "<span>昵称</span><span>" + data.user.userObj.nickName+
            "</span>"+
            "</div>" +
            "<div class='item'>" +
            "<span>真实姓名</span><span>" + data.user.userObj.realName.name+
            "</span>" +
            "</div>" +
            "<div class='item'>" +
            "<span>微信</span><span>" + data.user.userObj.wechat+
            "</span>" +
            "</div>" +
            "<div class='item'>" +
            "<span>邮箱</span><span>" + data.user.userObj.email+
            "</span>"+
            "</div>" +
            "<div class='item'>" +
            "<span>手机号</span><span>" + data.user.userObj.phoneNumber+
            "</span>" +
            "</div>" )

          if(data.topics.length > 0){
            data.topics.forEach(function (obj, i, arr) {
              $("#topicMsg").append("<div class='topic-item'>" +
                "<div class='item'>" +
                "<span>团队名称</span><span>" + obj.title+
                "</span>" +
                "</div>" +
                "<div class='item'>" +
                "<span>团队简介</span><span>" + obj.brief+
                "</span>" +
                "</div>" +
                "<div class='item'>" +
                "<span>创建时间</span><span>" + moment(obj.createAt).format('YYYY.MM.DD HH:MM:SS')+
                "</span>"+
                "</div>" +
                "<div class='item'>" +
                "<span>结束时间</span><span>" + moment(obj.endAt).format('YYYY.MM.DD HH:MM:SS')+
                "</span>" +
                "</div>" +
                "<div class='item'>" +
                "</div>"+
                "</div>")
            })
          }else{
            $("#topicMsg").append("<div>暂无话题</div>")
          }
        }
      }
    })
  })
});

$(document).ready(function () {
  $('#userTable').DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": false,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "pageLength": 10,
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

  $('#teamTable').DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": false,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "pageLength": 10,
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

  $("#topics").DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": false,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "pageLength": 10,
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
  $("#members").DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": false,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "pageLength": 10,
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
  $("#tasks").DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": false,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "pageLength": 10,
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
  $("#teams").DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": false,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "pageLength": 10,
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
})