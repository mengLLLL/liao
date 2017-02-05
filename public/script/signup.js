/**
 * Created by MengL on 2016/12/13.
 */
var socket = io('/');
$("#signup").click(function (e) {
  e.preventDefault();
  var obj = {};
  if($("input[name='phone']").val()==""){
    return swal("用户名不能为空")
  }
  if($("input[name='password']").val().length < 6){
    return swal("密码不能小于6位")
  }
  obj.nickName = $("input[name='phone']").val();
  obj.password = $("input[name='password']").val();
  obj.invest = false;
  $.ajax({
    type:'POST',
    url:"/signup",
    data:obj,
    dataType:"json",
    success: function (data) {
      console.log('data', data)
      if(data.success){
        socket.emit('login', data.userId);
        return window.location.href = "/new";
      }else{
        swal(data.errMsg)
      }
    }
  })
});