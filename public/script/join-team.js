/**
 * Created by MengL on 2016/12/9.
 */
var socket = io.connect('/');
//$("#teamName").keyup(function () {
//  if($(this).val()==''){
//    $("#searchTeam").attr("disabled",true)
//  }else{
//    $("#searchTeam").attr("disabled",false)
//  }
//})
//$("#searchTeam").click(function (e) {
//  var obj = {};
//  var teamName = $("input[name='teamName']").val();
//  obj.teamName = teamName;
//  console.log('search', teamName);
//  $.ajax({
//    type:"POST",
//    url:"/search/team",
//    data:obj,
//    dataType:'json',
//    success: function (data) {
//      if(data.success){
//        console.log('data',data)
//        var teams = data.teams;
//        $(".search-results").html("");
//        if(teams.length == 0){
//          return $('.search-results').html("没有符合条件的团队")
//        }
//        teams.forEach(function (obj, i, arr) {
//          if(obj.meng){
//            $(".search-results").append("<div class='team-name'>" + obj.name +
//              "</div>" +
//              "<div class='team-manager'>" + obj.manager +
//              "</div>" +
//              "<div class='team-createAt'>" + moment(obj.createAt).format("YYYY.MM.DD") +
//              "</div>" +
//              "<span>已加入</span>")
//          }else{
//            if(data.applyTeams){
//              //申请的团队是没有加入的，那么要分两种情况，即有没有申请过,<0,即不在申请列表里面
//              if($.inArray(obj.teamId, data.applyTeams) < 0){
//                $(".search-results").append("<div class='team-name'>" + obj.name +
//                  "</div>" +
//                  "<div class='team-manager'>管理员：" + obj.manager +
//                  "</div>" +
//                  "<div class='team-createAt'>" + moment(obj.createAt).format("YYYY.MM.DD") +
//                  "</div>" +
//                  "<div class='btn' onclick='joinTeam("+ obj.teamId +")'>" + "申请加入"+
//                  "</div>")
//              }else{
//                $(".search-results").append("<div class='team-name'>" + obj.name +
//                  "</div>" +
//                  "<div class='team-manager'>管理员：" + obj.manager +
//                  "</div>" +
//                  "<div class='team-createAt'>" + moment(obj.createAt).format("YYYY.MM.DD") +
//                  "</div>" +
//                  "<span>已申请，待管理员审核。</span>")
//              }
//            }else{
//              $(".search-results").append("<div class='team-name'>" + obj.name +
//                "</div>" +
//                "<div class='team-manager'>" + obj.manager +
//                "</div>" +
//                "<div class='team-createAt'>" + moment(obj.createAt).format("YYYY.MM.DD") +
//                "</div>" +
//                "<div class='btn' onclick='joinTeam("+ obj.teamId +")'>" + "申请加入"+
//                "</div>")
//            }
//
//
//          }
//
//        })
//      }
//    }
//  })
//});

function joinTeam(id){
  var obj = {
    id: id,
    userId: $('#userId').val()
  };
  console.log('join')
  $.ajax({
    type:"POST",
    url:"/apply/team",
    data:obj,
    dataType:'json',
    success: function(data){
      if(data.success){
        console.log('success',data);
        socket.emit('sendNotification',data.from, data.touser);
        $('.feedback').append("<span>申请已发送，请等待管理员通过或者" +
          "<a href='/new'>新建团队</a>" +
          "</span>")
      }else{
        //错误处理
        alert('error')
      }
    }
  })

}

//重新设置socket每个需要用socket的页面都要有emit和on这两个
socket.on('to'+ $('#userId').val(), function (data) {
  alert('receive');
  console.log(data)
});
socket.emit('setSocket',$('#userId').val())


