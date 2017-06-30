/**
 * Created by MengL on 2016/12/22.
 */
var base_url = "http://localhost:8080";
// var base_url = "http://121.41.54.233/donewclub_server";
//
//var socket = io.connect('/topic');
//socket.on('to'+ $("#userId").val(), function (data) {
//  $(".new-msg").show();
//});


/**
 * need jquery
 * @param file
 * @param params
 * @param callback
 */
function upload(file, params, callback) {
  var policyBase64 = params.policyBase64;
  var signature = params.signature;
  var filePathName = params.filePath + "/" + params.fileName;
  var fileFullName = params.host + "/" + filePathName;
  var request = new FormData();
  request.append('OSSAccessKeyId', params.accessKeyId);
  request.append('policy', policyBase64);
  request.append('Signature', signature);
  request.append('key', filePathName);
  request.append('file', file);
  $.ajax({
    url: params.host,
    data: request,
    processData: false,
    cache: false,
    async: true,
    contentType: false,
    type: "POST",
    success:function (data, textStatus) {
      if(textStatus == "nocontent") {
        callback(params.host + "/" + params.filePath + "/" + encodeURIComponent(params.fileName));
      } else {
        callback("error");
      }
    },
    error: function (error) {
      console.log(error);
      callback("error");
    },
    xhr: function () {
      var xhr = $.ajaxSettings.xhr();
      if(progress && xhr.upload) {
        xhr.upload.addEventListener('progress', progress, false);
        return xhr;
      }
    }
  });
}
function progress(e) {
  var progressBar = $("#file-progress-bar");
  var percent = e.loaded*100/e.total;
  percent = percent.toFixed(1);
  progressBar.attr("aria-valuenow", percent);
  progressBar.css("width", percent + "%");
  progressBar.text(percent + "%");
}

/**
 * need Base64, HMAC, SHA1
 * @param fileName
 * @param filePath
 * @returns {{}}
 */
function getUploadParams(fileName, filePath) {
  var accessId= 'zSwxczXm8dIp181W';
  var accessKey= '5c3QxlfG9fLKGOFNPmeuO1kJX0l9bv';
  var host = 'http://donew.oss-cn-hangzhou.aliyuncs.com';

  var policyText = {
    "expiration": "2020-01-01T12:00:00.000Z", //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
    "conditions": [
      ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
    ]
  };

  var policyBase64 = Base64.encode(JSON.stringify(policyText));
  var bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accessKey, { asBytes: true });
  var signature = Crypto.util.bytesToBase64(bytes);

  var params = {};
  params.accessKeyId = accessId;
  params.policyBase64 = policyBase64;
  params.signature = signature;
  params.filePath = filePath;
  params.host = host;
  params.fileName = fileName;
  return params;
}

//触发上传文件
$(".addFile").bind('click',function (e) {
  e.preventDefault();
  $(this).siblings('.input-group').children('.file-upload-group').children('.chooseFile').trigger('click');
});

$(".chooseFile").change(function(){
  $(this).siblings('.confirmFile').click();
});

/**
 * @param obj   this
 * @param type   upload file type
 */
function uploadFile(obj, type) {
  var files = $(obj).siblings('input[type=file]')[0].files;
  console.log('files', files)
  //var files = $('.file-upload-group').children("input[type=file]")[0].files;
  var fileType = files[0].name.split('.').pop().toLowerCase();
  var file_type;
  var chat_type;
  switch(fileType){
    case 'png':
      file_type = 1;
      chat_type = 2;
      break;
    case 'jpg':
      file_type = 1;
      chat_type = 2;
      break;
    case 'jpeg':
      file_type = 1;
      chat_type = 2;
      break;
    case 'pdf':
      file_type = 2;
      chat_type = 3;
      break;
    case 'doc':
      file_type = 2;
      chat_type = 3;
      break;
    default:
      file_type = 3;
      chat_type = 3;
      break
  }
  if(files.length > 0) {
    var file = files[0];
    var projectId = $("#Title").data("id");
    if(typeof type != "undefined") {
      type += "/";
    } else {
      type = "";
    }
    var filePath = "liao/" + type +   projectId + "/" +  getFormatDate(new Date());
    var params = getUploadParams(file.name, filePath);
    $(obj).parent().append(
      "<span class='progress' style='display: inline-flex; width: 300px;' id='file-progress'>"+
      "<span class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%;' id='file-progress-bar'>" +
      "0%" +
      "</span>" +
      "</span>"
    );
    upload(file, params, function (src) {
      if(src != "error") {
        $(obj).parent().children("input[type=hidden]")[0].value = src;
        $(obj).removeClass("btn-warning");
        $(obj).addClass("btn-success");
        //swal('上传成功！')
        console.log('上传成功')
        // 当作聊天信息发送过去,并且存在话题的files数组中
        var dataObj = {
          chatContent: src,
          topicId: projectId,
          chat_type:chat_type,
          fileObj: {
            file_type: file_type,
            topicId: projectId,
            source: src,
            fileName:file.name
          }
        };
        $.ajax({
          type:"POST",
          url:"/chat",
          data: dataObj,
          dataType: 'json',
          success: function(data){
            console.log('data',data)
            if(data.success){
              var chatItem = {
                chat_type: data.publicChat.chat_type,
                at: false,
                chatObj:{
                  chatItemId: data.publicChat.chatItemId,
                  chatContent: data.publicChat.chatContent,
                  chatRecordId: data.chatRecordId,
                  createAt: data.publicChat.createAt,
                  fileName: file.name
                },
                user: data.user,
                topicId: dataObj.topicId,
                file_id: data.file_id
              }
              socket.emit('public chat', chatItem)
            }
          }
        });

      } else {
        $(obj).removeClass("btn-warning");
        $(obj).addClass("btn-danger");
        swal("上传失败,请重试");
      }
      $("#file-progress").remove();
    });
  } else {
    alert("请选择文件");
  }
}

$(".input-file-upload").click(function () {
  // console.log(this);
  $(this).parent().children("input[type=file]")[0].click();
  var files = $(this).parent().children("input[type=file]")[0].files;
  if(files.length > 0) {
    $(this).val(files[0].name);
  }
  this.blur();
});




$.each($(".input-file"), function (i, item) {
  item.onchange = function () {
    var fileName = "";
    if(item.files.length > 0) {
      fileName = item.files[0].name;
    }
    $(this).parent().children("input[type=text]")[0].value = fileName;
    $(this).parent().children("button").addClass("btn-warning");
  };
});


String.prototype.startWith=function(s){
  if(s==null||s==""||this.length==0||s.length>this.length)
    return false;
  return this.substr(0,s.length)==s;
};

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};





function getFormatTime(ns) {
  if(typeof ns == "undefined")
    return "-";
  var newDate = new Date();
  newDate.setTime(ns);
//	return newDate.toLocaleString();
  return newDate.format("hh:mm:ss");
}

function getFormatDate(ns) {
  if(typeof ns == "undefined")
    return "-";
  var date = new Date();
  date.setTime(ns);
  return date.format("yyyy-MM-dd");
}

function getFormatFullTime(ns) {
  if(typeof ns == "undefined")
    return "-";
  var date = new Date();
  date.setTime(ns);
  return date.format("yyyy-MM-dd hh:mm:ss");
}

Date.prototype.format = function(format) {
  /*
   * eg:format="YYYY-MM-dd hh:mm:ss";
   */
  var o = {
    "M+" :this.getMonth() + 1, // month
    "d+" :this.getDate(), // day
    "h+" :this.getHours(), // hour
    "m+" :this.getMinutes(), // minute
    "s+" :this.getSeconds(), // second
    "q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
    "S" :this.getMilliseconds()
    // millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "")
      .substr(4 - RegExp.$1.length));
  }

  for ( var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
        : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};
