/**
 * Created by MengL on 2016/12/12.
 */
var socket = io.connect('http://localhost:8080');
socket.on('news', function (data) {
  console.log(data);
});