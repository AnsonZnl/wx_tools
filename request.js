const app = getApp()
const APIVERSION = '1.0' //调用接口版本
const DEVICE = 'wxApp' //调用接口设备为小程序
const baseUrl = app.globalData.apiUrl || wx.getStorageSync('_apiUrl')

function request(obj) {
  const header = {
    'content-type': 'application/json',
    'TOKEN': wx.getStorageSync('_token') || '',
    'APIVERSION': APIVERSION,
    'DEVICE': DEVICE,
    'Accept': '*/*'
  }
  // 错误处理
  function errorHandle(res) {
    // 服务器错误
    if (res.statusCode == 500) {
      wx.showToast({
        title: '服务器错误',
        icon: 'none'
      })
      return false;
    }
    // 未授权
    if (res.statusCode == 401) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return false;
    }
    // token 更新
    if (res.header["TOKEN"] && header['TOKEN'] != res.header["TOKEN"]) {
      wx.setStorageSync('_token', res.header["TOKEN"])
      
    }
  }
  // 默认参数 兜底的参数
  const defaultObj = {
    url: `${baseUrl}${obj.url}`,
    header: Object.assign({}, header, obj.header),
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    enableHttp2: false,
    enableQuic: false,
    enableCache: false,
  }
  // 根据传来的参数，形成最终形成的参数，除了success和fail都可以定义
  const finalObj = Object.assign({}, obj, defaultObj)
  //优化：使用Object.assign 由两个对象和并为一个对象 
  return new Promise((resolve, reject) => {
    wx.request({
      ...finalObj,
      success(res) {
        if (res.statusCode == 200 || res.statusCode == 201) {
          resolve(res)
        }else{
          errorHandle(res)
          reject(err)
        }
      },
      fail(err) {
        errorHandle(err)
        reject(err)
      }
    })
  })
}

export default request
// 用法
// epwx.request({url: ''}).then(res=>{}).catch(err=>{})
