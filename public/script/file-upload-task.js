/**
 * Created by MengL on 2016/12/22.
 */
/**
 * Created by MengL on 2016/12/22.
 */
var base_url = "http://localhost:8080";
// var base_url = "http://121.41.54.233/donewclub_server";



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
$("#addFile").bind('click',function (e) {
  e.preventDefault();
  $("#chooseFile").trigger('click')

});

$("#chooseFile").change(function(){
  $("#confirmFile").click()
})

/**
 * @param obj   this
 * @param type   upload file type
 */
function uploadFile(obj, type) {
  var files = $('.file-upload-group').children("input[type=file]")[0].files;
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
    var projectId = $("#taskId").data("taskid");
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
        console.log('src',src)
        $(obj).parent().children("input[type=hidden]")[0].value = src;
        $(obj).removeClass("btn-warning");
        $(obj).addClass("btn-success");

        var fileObj = {
          file_type: file_type,
          taskId: projectId,
          source: src,
          fileName:file.name
        };
        $.ajax({
          type:"POST",
          url:"/file/task",
          data: fileObj,
          dataType: 'json',
          success: function (data) {
            if(data.success){
              console.log('data',data)
              console.log("文件已经保存")
              swal("上传成功");
              if(file_type == 1){
                $('#taskFileCenter .file-box').append("<div class='file-item' id='" + data.file.files[data.file.files.length-1]._id+"' " +
                  "data-src='" +data.file.files[data.file.files.length-1].source+"' data-filetype='"+file_type+
                  "' data-upuserid='"+ data.file.files[data.file.files.length-1].uploader.id+
                  "' data-upusername='" +data.file.files[data.file.files.length-1].uploader.name+"'>" +fileObj.fileName+
                  "<i class='fa fa-star-o collectFile'></i>" +
                  "<i class='fa fa-trash deleteFile'></i>"+
                  "</div>")
              }

            }
          }
        })

      } else {
        $(obj).removeClass("btn-warning");
        $(obj).addClass("btn-danger");
        swal("上传失败");
      }
      $("#file-progress").remove();
    });
  } else {
    swal("请选择文件");
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

/**
 * 双击修改头像函数
 * @param obj
 */
function changeUploadFile(obj){
  // console.log("changeUploadFile");
  console.log(obj)
  var html = '';
  html += "<input type='file'  class='input-file change' style='display:none' />"
  $(obj).after(html);
  //$(".change").click();
  $(obj).siblings('.avatar-tip').prev('.change').click();
  $.each($(".change"), function (i, item) {
    item.onchange = function () {
      var files = item.files;
      if(files.length>0){
        var file = files[0];
        var projectId = 1;
        var type = 'logo';
        if(typeof type != "undefined"){
          type += "/";
        }else{
          type ="";
        }
        var filePath = "" + projectId + "/" + type + getFormatDate(new Date());
        var params = getUploadParams(file.name,filePath);
        console.log(params)
        upload(file,params, function (src) {
          console.log(src)
          if(src != "error"){
            obj.src = src
          }else{
            console.log("failed to change");
          }
        })
      }

    };
  })

}
String.prototype.startWith=function(s){
  if(s==null||s==""||this.length==0||s.length>this.length)
    return false;
  return this.substr(0,s.length)==s;
};

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


function changePassword() {
  var token = getCookie("token");
  if(typeof token != "undefined") {
    $("#modalChangePassword").modal();
  } else {
    alert("登录失效,请重新登录");
    window.location.href = "index.html";
  }
}
function AddMemberModal(){
  var token = getCookie("token");
  if(typeof token != "undefined") {
    $("#modalAddMembers").modal();
  } else {
    alert("登录失效,请重新登录");
    window.location.href = "index.html";
  }
}
function AddFinancialModal(){
  var token = getCookie("token");
  if(typeof token != "undefined") {
    $("#AddFinancialModal").modal();
  } else {
    alert("登录失效,请重新登录");
    window.location.href = "index.html";
  }
}
function AddIterationModal(){
  var token = getCookie("token");
  if(typeof token != "undefined"){
    $('#AddIterationModal').modal();
  }else{
    alert("登录失效,请重新登录");
    window.location.href = "index.html";
  }
}
function changePasswordSubmit() {
  var token = getCookie("token");
  if(typeof token != "undefined") {
    var originalPassword = $("#original-password").val().trim();
    var newPassword = $("#new-password").val().trim();
    var newPasswordRepeat = $("#new-password-repeat").val().trim();
    if(originalPassword == "") {
      alert("旧密码不能为空");
      return;
    }
    if(newPassword == "") {
      alert("新密码不能为空");
      return;
    }
    if(newPasswordRepeat == "") {
      alert("请再次输入新密码");
      return;
    }
    if(originalPassword == newPassword) {
      alert("新旧密码不能相同");
      return;
    }
    if(newPassword != newPasswordRepeat) {
      alert("两次输入新密码不相同");
      return;
    }
    $.ajax({
      url: base_url + "/users/resetPassword",
      method: "PATCH",
      data: {
        oldPassword: originalPassword,
        newPassword: newPassword,
        token: token
      },
      success: function (response, status, xhr) {
        if(xhr.status == 200 && response.success) {
          alert("修改成功,请重新登录");
          window.location.href = "index.html";
        } else {
          alert("修改失败");
        }
      },
      error: function (error) {
        alert("修改失败");
        console.log(error);
      }
    })
  } else {
    alert("登录失效,请重新登录");
    window.location.href = "index.html";
  }
}

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
