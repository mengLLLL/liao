/**
 * Created by MengL on 2016/12/13.
 */
var socket = io('/');
$('#login').click(function (e) {
  e.preventDefault();
  var obj={};
  obj.nickName = $("input[name='phone']").val();
  obj.password = $("input[name='password']").val();
  $.ajax({
    type:"POST",
    url:"/login",
    data:obj,
    dataType:'json',
    success: function (data) {
      if(data.success){
        console.log(data);

        return window.location.href="/liao";
      }else{
        //falseType 1 说明登录的时候没有团队，所以去创建
        if(data.falseType == 1){
          console.log('创建团队或者加入一个团队');
          return window.location.href="/new"
        }
        if(data.falseType == 2){
          console.log('该用户不存在');
          return window.location.href = "/login";
        }
        if(data.falseType == 3){
          console.log('密码错误');
          return window.location.href = "/login";
        }
      }
    }
  })
});