// 日期时间 格式化
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 封装request请求
function ajax(method = "POST", url, data = {}) {
  const baseUrl = wx.getStorageSync('_apiUrl') || '';
  // 统一的请求 header
  const header = {
    'content-type': 'application/json',
    'TOKEN': wx.getStorageSync('_token') || '',
    'APIVERSION': '1.0',
    'DEVICE': 'wxApp',
    'Accept': '*/*'
  }

  // 统一的 错误处理
  function errorHandle(res) {
    // 服务器错误
    if (res.statusCode == 500) {
      wx.showToast({
        title: '服务器错误',
        icon: 'none'
      })
      return false;
    } else if (res.statusCode == 401) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return false;
    } else {
      console.error('未知错误', res)
    }
    // token 更新
    if (res.header["TOKEN"] && header['TOKEN'] != res.header["TOKEN"]) {
      wx.setStorageSync('_token', res.header["TOKEN"]);
    }
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${baseUrl}${url}`,
      data: data,
      method: method,
      header: header,
      success(res) {
        if (res.header.TOKEN) wx.setStorageSync('_token', res.header.TOKEN)

        if (res.statusCode == 200 || res.statusCode == 201) {
          if (res.data.Flag) {
            resolve(res);
          } else {
            wx.showToast({
              title: res.data.ErrorMsg || `响应错误，状态码${res.statusCode}`,
              icon: 'none',
            })
            reject(res);
          }
        } else {
          wx.showToast({
            title: `响应错误，状态码${res.statusCode}`,
            icon: 'none',
          })
          errorHandle(res)
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({
          title: `网络错误，状态码${err.statusCode}`,
          icon: 'none',
        })
        errorHandle(err)
        reject(err);
      }
    })
  })
}
// 封装uploadFile请求
function uploadFile(url, filePath, data = {}, name = 'fileName', ) {
  const baseUrl = wx.getStorageSync('_apiUrl') || '';
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${baseUrl}${url}`,
      filePath: filePath,
      name: name,
      formData: data,
      header: {
        "content-type": "multipart/form-data"
      },
      success(res) {
        resolve(res);
      },
      fail(err) {
        reject(err);
      }
    })
  })
}
// router 防止页面栈爆满
function router(obj) {
  if (getCurrentPages().length > 8) {
    wx.redirectTo(obj);
  } else {
    wx.navigateTo(obj)
  }
}

/**
 * 函数节流
 * @param fn 需要进行节流操作的事件函数
 * @param interval 间隔时间
 * @returns {Function}
 */
function throttle(fn, interval) {
  var enterTime = 0; //触发的时间
  var gapTime = interval || 500; //间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = +new Date(); //第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/**
 * 函数防抖
 * @param fn 需要进行防抖操作的事件函数
 * @param interval 间隔时间
 * @returns {Function}
 */
function debounce(fn, interval = 500) {
  var timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, args[0]);
    }, interval);
  };
}

module.exports = {
  formatTime,
  ajax,
  uploadFile,
  router,
  throttle,
  debounce
}
