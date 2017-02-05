/**
 * Created by MengL on 2017/1/18.
 */
var socket = io('/');

$("#signup").click(function (e) {
  e.preventDefault();
  var obj = {};
  obj.nickName = $("input[name='phone']").val();
  obj.password = $("input[name='password']").val();
  obj.invest = true;
  obj.teamId = $(this).data('teamid');
  if($(this).data('tag')==1){
    obj.topicId = $(this).data('topicid');
  }
  obj.tag= $(this).data('tag');
  //tag=0仅仅加入团队
  //tag=1加入团队并且加入某个话题
  console.log('obj', obj)
  $.ajax({
    type:'POST',
    url:"/signup",
    data:obj,
    dataType:"json",
    success: function (data) {
      if(data.success){
        socket.emit('login', data.userId);
        console.log('data',data)
        return window.location.href = "/liao";
      }else{
        swal(data.errMsg)
        //console.log('注册失败')
      }
    }
  })
})