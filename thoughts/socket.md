### 基本用法
* 服务器端（可以发送事件，可以接受事件）
```
io.on('event name', function(socket){
    socket.emit('eventNAme'[,参数，回调函数])
})
```

* 客户端（可以发送事件，可以接受事件）
```
var socket = io.connect('http://localhost:8080');
socket.on('event name', function(data){
    socket.emit('other event'[,参数，回调函数])
})
```

##### 通知的实现

1. a用户提交申请加入某团队的请求
2. 服务器端向b发送事件，"a申请加入**团队"
3. b如果在线，那就立即显示，如果不在线，存到数据库中，待b上线时（每个用户上线都会遍历一下未读消息）

####socket
- 每建立一个socket,都会有一个socket.id来唯一标识