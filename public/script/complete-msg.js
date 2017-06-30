/**
 * Created by MengL on 2017/2/16.
 */
$(function () {
  $('#complete').click(function (e) {
    e.preventDefault();
    var realName = $("input[name='realName']").val();
    var phoneNumber = $("input[name='phoneNumber']").val();
    var email = $("input[name='email']").val();
    var wechat = $("input[name='wechat']").val();
    var department = $("input[name='department']").val();
    var job = $("input[name='job']").val();
    if(realName == ""){
      return swal("请输入真实姓名")
    }
    var dataObj = {
      realName: realName,
      phoneNumber: phoneNumber,
      email: email,
      wechat: wechat,
      department: department,
      job: job
    };
    $.ajax({
      url:'/complete',
      type: 'POST',
      data: dataObj,
      dataType: 'json',
      success: function (data) {
        if(data.success){
          window.location.href='/new'
        }else{
          swal('请重试')
        }
      }
    })
  })



});