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

$("[data-toggle='tooltip']").tooltip();

  $("#teamName").keyup(function () {
    if($(this).val()==''){
      $("#searchTeam").attr("disabled",true)
    }else{
      $("#searchTeam").attr("disabled",false)
    }
  })
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
  //切换团队
  $("#exchangeTeam").click(function (e) {
    $("#teamSetting").hide();
    e.preventDefault();
    $.ajax({
      type:"GET",
      url:"/all/team",
      success:function(data){
        console.log(data);
        if(data.success){
          var teams = data.teams;
          $("#teamList").html("");
          teams.forEach(function (obj, i, arr) {
            $("#teamList").append("<div class='team-item'>" +
              "<span>" + obj.name +
              "</span>" +
              "<a class='btn btn-default' href='/exchange/team?teamId=" + obj.teamId+ "'>切换</a>" +
              "</div>")
          })
          $("#exchangeTeamShade").show()

        }
      }
    })
  })
  //加入新团队
  $("#joinTeam").click(function (e) {
    e.preventDefault();
    $("#teamSetting").hide();
    $("input[name='teamName']").val("");
    $('.search-results').html("");
    $(".feedback").html("");
    $("#joinNewTeam").show()
  })


  $('#searchTeam').click(function (e) {
    e.preventDefault();
    var teamName = $("input[name='teamName']").val();
    if(teamName == ""){
      return $(".feedback").html("输入不能为空")
    }
    var obj = {
      teamName: teamName
    }
    $.ajax({
      type:"POST",
      url:"/search/team",
      data: obj,
      dataType: 'json',
      success: function (data) {
        if(data.success){
          console.log('data',data)
          var teams = data.teams;
          $(".search-results").html("");
          if(teams.length == 0){
            return $('.search-results').html("没有符合条件的团队")
          }
          $(".search-results").append("<div class='search-header'>搜索结果:</div>")
          teams.forEach(function (obj, i, arr) {
            if(obj.meng){
              $(".search-results").append("<div class='search-item'><span class='team-name'>" + obj.name +
                "</span>" +
                "<div class='team-manager'>管理员:" + obj.manager +
                "</div>" +
                "<div class='team-createAt'>创建于:" + moment(obj.createAt).format("YYYY.MM.DD") +
                "</div>" +
                "<span>状态：已加入</span></div>")
            }else{
              if(data.applyTeams.length > 0){
                //申请的团队是没有加入的，那么要分两种情况，即有没有申请过,<0,即不在申请列表里面
                if($.inArray(obj.teamId, data.applyTeams) < 0){
                  $(".search-results").append("<div class='search-item'><span class='team-name'>" + obj.name +
                    "</span>" +
                    "<div class='team-manager'>管理员:" + obj.manager +
                    "</div>" +
                    "<div class='team-createAt'>创建于:" + moment(obj.createAt).format("YYYY.MM.DD") +
                    "</div>" +
                    "<div class='m-btn' onclick='joinTeam("+ obj.teamId +")'>" + "申请加入"+
                    "</div></div>")
                }else{
                  $(".search-results").append("<span class='team-name'>" + obj.name +
                    "</span>" +
                    "<div class='team-manager'>管理员:" + obj.manager +
                    "</div>" +
                    "<div class='team-createAt'>创建于:" + moment(obj.createAt).format("YYYY.MM.DD") +
                    "</div>" +
                    "<span>状态：已申请，待管理员审核。</span>")
                }
              }else{
                $(".search-results").append("<div class='search-item'><span class='team-name'>" + obj.name +
                  "</span>" +
                  "<div class='team-manager'>管理员:" + obj.manager +
                  "</div>" +
                  "<div class='team-createAt'>创建于:" + moment(obj.createAt).format("YYYY.MM.DD") +
                  "</div>" +
                  "<div class='m-btn' onclick='joinTeam("+ obj.teamId +")'>" + "申请加入"+
                  "</div></div>")
              }


            }

          })
        }
      }
    })

  })
})


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






