//路径根据自己项目路径修改
var ias = require("../../api.js")
var aes = require("../../static/aes/aesUtil.js");
const app = getApp();

Page({
  data: {
    hiddenVideo: true,
    photos:[],
    audioURL: null,
    videoURL: null,
    category: "",
    project: "",
    repairLevel:null,
    deviceDetail:null,
    installationPosition:"",
    allParams:{
      macId:null,
      typeId: null,
      roomId: null,
      descs: null,
      lavel: "1",
      uploadId: null
    },
    photosID:[],
    audioID:[],
    videoID:[],
  },
  /**
   * init 初始化函数
   */
  onLoad: function (options) {
    let strRoom = "allParams.roomId", id = options.deviceID;
   
    if (options.deviceID != 0){
      this.getRepairDetail(id);
    }else{
      this.setData({
        [strRoom]: wx.getStorageSync('roomID'),
        installationPosition: wx.getStorageSync('installationPosition'),
      })
    }
    this.getRepairLevel();
    
    },
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  onShow: function(res){
    console.log(this.data)
  },
  /**
   * 获取设备详情
   */
  getRepairDetail: function (id) {
    var _this = this;
    var data = {
      "id": id
    }
    //路径根据自己项目路径修改
    ias.requestLoading('POST', ias.api.drivceDetail, JSON.stringify(data).encode(), '正在加载数据', function (res) {
      //res就是我们请求接口返回的数据
      console.log(res)
      if (res.results.equip){
        let stMac = "allParams.macId", strRomm = "allParams.roomId";
        _this.setData({
          installationPosition: res.results.equip.location,
          deviceDetail: res.results.equip,
          [stMac]: res.results.equip.id,
          [strRomm]: res.results.equip.roomId,
        })
      }
    }, function () {
      wx.showToast({
        title: '加载数据失败',
      })
    })
  },
  /**
   * 获取报修项目
   */
  getRepairProject: function () {
    const _this = this;
    let data = {
      "tenantCode": "zzyy"
    }
    if (wx.getStorageSync('repairProject').length > 0) {
      wx.navigateTo({
        url: './select_project/index'
      })
      return false
    }
    ias.requestLoading('POST', ias.api.repairProject, JSON.stringify(data).encode(), '', function (res) {
      wx.setStorageSync('repairProject', res.results)
      wx.navigateTo({
        url: './select_project/index'
      })
    }, function () {
      wx.showToast({
        title: '加载项目失败',
      })
    })
  },
  /**
   * 获取描述内容
   */
  descsInput: function (e) {
    let str = "allParams.descs"
    this.setData({
      [str]: e.detail.value
    })
  },
  /**
    * 得到紧急程度枚举
    */
  getRepairLevel: function () {
    console.log("得到紧急程度枚举")
    const _this = this;
    ias.requestLoading('POST', ias.api.repairLevel, {}, '', function (res) {
      _this.setData({
        repairLevel: res
      })
    }, function () {
      wx.showToast({
        title: '加载枚举失败',
      })
    })
  },
  /**
    * 录音
    */
  recoder: function(e){
    wx.navigateTo({
      url: './recorder/index'
    })
  },
  /**
    * 选择相册
    */
  chooseImageA: function (e) {
    var _this = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePath = res.tempFilePaths,
            urls = ias.api.uploadFile;
        //上传照片
        processFileUploadForIMG(urls, tempFilePath, _this);
       
      }
    })
  },
   /**
    * 拍照
    */
  chooseImageC: function (e) {
    var _this = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePath = res.tempFilePaths,
          urls = ias.api.uploadFile;
        //上传照片
        processFileUploadForIMG(urls, tempFilePath, _this);
      }
    })
  },
  /*
   *照片预览
   */
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.photos // 需要预览的图片http链接列表
    })
  },
  /*
   *音频预览
   */
  previewAudio: function (e) {
    wx.navigateTo({
      url: './preview_audio/index'
    })
  },
  /**
    * 阻止事件冒泡
    */
  stopPropagation:function (e){
      console.log("阻止事件冒泡")
  },
  /**
   * 监听视频加载错误状态
   */
  listenerVideo: function (e) {
    console.log(e.detail.errMsg);
  },
  /**
   * 拍摄视频
   */
  addVideo: function () {
    var _this = this
    wx.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 30,
      camera: 'back',
      success: function (res) {
        console.log('add video')
        var tempFilePath = res.tempFilePath,
          urls = ias.api.uploadFile;

        //上传视频
        processFileUploadForMedia(urls, tempFilePath, _this);

      }
    })
  },
  /**
   * 监听点击事件，预览视频
   */
  previewVideo: function (e) {
    console.log('play')
       this.videoContext.play();
      this.videoContext.requestFullScreen();
    this.setData({
      hiddenVideo: !this.data.hiddenVideo
    })
  },
  
  /**
   * 监听枚举选择
   */
  listenerLavel: function (e) {
    console.log(e.target.id);
    let str = "allParams.lavel"
    this.setData({
      [str]: e.target.id
    })
  },
   /**
   * 删除附件
   */
  deleteAudio:function(){
    let _this = this;
    _this.setData({
      audioURL:"",
      audioID: []
    })
  },
  deleteIMG: function (e) {
    let _this = this;
    let arr = _this.data.photos, arrID=_this.data.photosID;
    arrID.splice(e.target.id, 1);
    arr.splice(e.target.id, 1);
    _this.setData({
      photos: arr,
      photosID: arrID
    })
  },
  deleteVideo: function (e) {
    let _this = this;
    _this.setData({
      videoURL: "",
      videoID:[]
    })
  },
  /**
   * 提交报修
   */
  subRepair: function (e){
    let _this = this
      , str = "allParams.uploadId"
      ,resultsMedia = _this.data.photosID.concat(_this.data.audioID, _this.data.videoID);
    _this.setData({
      [str]:resultsMedia.join(",")
    })

    console.log(this.data.allParams)
    let data = this.data.allParams;

    ias.requestLoading('POST', ias.api.createScan, JSON.stringify(data).encode(), '提交中...', function (res) {
      if (res.status == 200){
        let _orderId = res.results || "";
        wx.setStorageSync('repairid', res.results)
        wx.redirectTo({
          url: '../msg/index'
        })
      }else{
        wx.showToast({
          icon:"none",
          title: res.message,
        })
      }
    }, function () {
      wx.showToast({
        title: '报修失败！',
      })
    })
   
  }
  
});

/**
  * 上传图片文件
  */
function processFileUploadForIMG(urls, filePath, _this) {
  wx.uploadFile({
    url: ias.api.basePath + urls,
    filePath: filePath[0],
    name: 'file',
    // formData: { "appKey": appkey, "appSecret": appsecret, "userId": UTIL.getUserUnique() },
    header: { 'content-type': 'multipart/form-data' },
    success: function (res) {
      console.log(JSON.parse(res.data));
        let resAll = JSON.parse(res.data).results;
        let resID = resAll.id,
            typeID = resAll.type;
        _this.data.photosID.push(resID);
        _this.setData({
          photos: _this.data.photos.concat(filePath),
        });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: "网络请求失败，请确保网络是否正常",
        showCancel: false,
        success: function (res) {
        }
      });
      wx.hideToast();
    }
  });
}
//上传媒体文件
function processFileUploadForMedia(urls, filePath, _this) {
  wx.uploadFile({
    url: ias.api.basePath + urls,
    filePath: filePath,
    name: 'file',
    // formData: { "appKey": appkey, "appSecret": appsecret, "userId": UTIL.getUserUnique() },
    header: { 'content-type': 'multipart/form-data' },
    success: function (res) {
        console.log(JSON.parse(res.data));
        var resAll = JSON.parse(res.data).results;
        var resID = resAll.id,
          typeID = resAll.type;
        switch (typeID) {
          case "video":
            _this.data.videoID.push(resID);
            _this.setData({
              videoURL: filePath
            });
            break;
          default:

      }
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: "网络请求失败，请确保网络是否正常",
        showCancel: false,
        success: function (res) {
        }
      });
      wx.hideToast();
    }
  });
}