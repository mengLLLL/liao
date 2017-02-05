/**
 * Created by MengL on 2016/12/5.
 */

// 为空时不能提交
$("#newTeam").keyup(function () {
  if($(this).val()==''){
    $("#createBtn").attr("disabled",true)
  }else{
    $("#createBtn").attr("disabled",false)
  }
})