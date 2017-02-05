/**
 * Created by MengL on 2016/12/13.
 */

//var socket = io.connect('/');
//
////重新设置socket每个需要用socket的页面都要有emit和on这两个
//socket.on('to'+ $('#userId').val(), function (data) {
//  alert('receive');
//  console.log(data)
//});
//socket.emit('setSocket',$('#userId').val())
//$(function(){
//  console.log('id',$('#userId').val())
//});


$(document).ready(function () {

  $('.shade').click(function (e) {
    $(this).hide();
  });
  $('.shade').children().click(function (e) {
    e.stopPropagation();
  });


  $("#avatar").click(function () {
    if($("#userSetting").is(":hidden")){
      $("#userSetting").show()
    }else{
      $("#userSetting").hide()
    }
  });

  $("#teamSet").click(function () {
    console.log('haha')
    if($("#teamSetting").is(":hidden")){
      $("#teamSetting").show()
    }else{
      $("#teamSetting").hide()
    }
  })
  $("#exchangeTeam").click(function (e) {
    e.preventDefault();
    $.ajax({
      type:"GET",
      url:"/all/team",
      success:function(data){
        console.log(data)
        if(data.success){
          var teams = data.teams;
          teams.forEach(function (obj, i, arr) {
            $("#teamList").append("<div class='team-item'>" +
              "<span>" + obj.name +
              "</span>" +
              "<button onclick='changeTeam()' class='btn btn-default' > <a href='/exchange/team?teamId=" + obj.teamId+ "'>切换</a>" +
              "</button>" +
              "</div>")
          })
          $("#exchangeTeamShade").show()

        }
      }
    })
  })

})







