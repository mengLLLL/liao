/**
 * Created by MengL on 2016/12/27.
 */
var socket = io.connect('/');
socket.on('to'+ $("#userId").val(), function (data) {
  $(".new-msg").show();
});



$(document).ready(function () {
  $('.header-tab').click(function (e) {
    $('.header-tab').removeClass('active');
    $(this).addClass('active');
    $('.statistics-header').siblings().removeClass('show')
    $('#'+ $(this).data('type')).addClass('show')
  })
});
