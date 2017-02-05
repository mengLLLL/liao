/**
 * Created by MengL on 2016/12/27.
 */
var socket = io.connect('/');
socket.on('to'+ $("#userId").val(), function (data) {
  $(".new-msg").show();
});
var userId = $('.box').data('userid');
$("#confirm").click(function (e) {
  e.preventDefault();
  var newName = $("input[name='userName']").val();
  var psw1 = $("input[name='newPassword1']").val();
  var psw2 = $("input[name='newPassword2']").val();
  var oldpsw = $("input[name='oldPassword']").val();
  if(newName == ""||psw1 ==''||psw2==''||oldpsw==''){
    return console.log('输入数据不能为空')
  }
  if(psw1 !== psw2){
    return console.log("两次输入密码不一致，重新输入")
  }
  var obj = {
    name:newName,
    psw: psw1,
    oldpsw: oldpsw
  }
  $.ajax({
    type:"POST",
    url:"/set/user",
    data: obj,
    success: function (data) {
      if(data.success){
        console.log(data)
        location.reload();
      }else{
        console.log('更改失败')
      }
    }
  })
});

$(document).ready(function () {
  $('.edit-btn').click(function(e){
    e.preventDefault();
    $(this).parent('.edit-part').parent('.sub-box').hide();
    $(this).parent('.edit-part').parent('.sub-box').next().show();
  })

//tab切换
  $('.header-tab').click(function(){
    $('.header-tab').removeClass('active');
    $(this).addClass('active');
    $('.part').removeClass('show');
    $('#'+ $(this).data('type')).addClass('show');

  })

//修改昵称
  $('#changeNickName').click(function (e) {
    e.preventDefault();
    var nickName = $("input[name='newNickName']").val();
    if(nickName == ''){
      return swal('请输入用户名')
    }
    var dataObj = {
      userId: userId,
      nickName: nickName,
      changeType: '1'
    };
    $.ajax({
      type: 'POST',
      data: dataObj,
      url: '/user/setting',
      dataTye: 'json',
      success: function (data) {
        if(data.success){
          swal('用户修改成功');
          console.log('change nickName')
        }else{
          if(data.errCode == '1'){
            swal('用户名已存在，请重试')
          }else{
            swal('用户名修改失败，请重新尝试')
          }
        }
      }
    })
  })

  //修改密码
  $('#changePsd').click(function (e) {
    e.preventDefault();
    var psd1 = $("input[name='newpassword1']").val();
    var psd2 = $("input[name='newpassword2']").val();
    console.log('length', psd1,psd1.length)
    if(psd1.length < 6 || psd2.length < 6){
      return swal('密码不能少于6位，请重新输入')
    }
    if(psd1 !== psd2){
      return swal("两次输入不一致，请重新输入！")
    }
    var dataObj = {
      newPsd: psd1,
      userId: userId,
      changeType: '2'
    };
    $.ajax({
      type: 'POST',
      data: dataObj,
      url: '/user/setting',
      dataType: 'json',
      success: function (data) {
        if(data.success){
          swal("密码修改成功")
        }else{
          swal('密码修改失败，请重试')
        }
      }
    })
  })


  //TODO 真实姓名和手机号和邮箱没写
  $("#changeDepartment").click(function (e) {
    e.preventDefault();
    var department = $("input[name='department']").val();
    if(department == ""){
      return swal("输入不能为空")
    }
    var dataObj = {
      userId: userId,
      department: department,
      changeType: '4'
    }
    $.ajax({
      type: 'POST',
      data: dataObj,
      url:'/user/setting',
      dataType: 'json',
      success: function (data) {
        console.log('data',data)
        if(data.success){
          swal('修改成功')
        }else{
          swal('修改失败，请重新尝试')
        }
      }
    })
  })

  $("#changePosition").click(function (e) {
    e.preventDefault();
    var jobName = $("input[name='jobName']").val();
    console.log('jobName',jobName)
    if(jobName == ""){
      return swal("输入不能为空")
    }
    var dataObj = {
      jobName: jobName,
      changeType: '5'
    };

    $.ajax({
      url: '/user/setting',
      data: dataObj,
      dataType: 'json',
      type: 'POST',
      success: function(data){
        if(data.success){
          swal("修改成功")
        }else{
          swal("修改失败，请重新尝试")
        }
      }
    })
  })

  $("#changeWechat").click(function (e) {
    e.preventDefault();
    var wechat = $("input[name='wechat']").val();
    if(wechat == ""){
      return swal("输入不能为空")
    }
    var dataObj = {
      wechat: wechat,
      changeType: '6'
    }
    $.ajax({
      type: "POST",
      url:'/user/setting',
      data: dataObj,
      dataType: 'json',
      success: function(data){
        if(data.success){
          swal("修改成功")
          document.location.reload();
        }else{
          swal("修改失败，请重新尝试")
        }
      }
    })
  })

});