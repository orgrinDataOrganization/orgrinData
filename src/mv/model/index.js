/**
 * Created by linmingxiong on 16/9/27.
 */

require('./style.css');
var notice = require('../notice');
var alert = require('../alert');
var infoVm = require('../info');
console.log('---',infoVm)
var vm = avalon.define({
  $id: 'modelList',
  id: 0, //当前选中的模型
  pid: 0, //当前选中的模型类型
  data: [],
  searchText: '',
  request: function () {
    avalon.ajax({
      url:'/api/model/list',
      type:'get',
      data: {text: this.searchText},
      success: function (data) {
        console.log(data.data)
        vm.data=data.data;
        //vm.data=eval("(" + data + ")");
       //vm.data=d.Data;
        console.log(vm.data,vm.data[0].id);
        if (!vm.id) {
          vm.setDefaultItem();
        }
        vm.setCategoryByItemId(vm.id);
      }
    });
  },
  search: function () {
    if (!this.searchText) {
      notice.open({
        type: 'warning',
        content: '请输入关键词!'
      })
    } else {
      this.request()
    }
  },
  clickHandle: function (e) {
    this.id = e.id;
    var path = avalon.router.getLastPath().split('/')[1];
    location.hash = "#!/" + path + '/' + e.id
  },
  clickHandleCategory: function (e) {
    this.pid = e.clientsys;
  },
  setDefaultItem: function () {
    var path = location.hash.split('/')[1];
    path = path || 'info';

    var _item = null;
    avalon.each(vm.data, function (j, el) {
      if (el.list.length) {
        _item = el.list[0];
        return false;
      }
    });
    vm.id = _item.id;
    location.hash = "#!/" + path + '/' + vm.id;
      infoVm.request();
  },
  setCategoryByItemId: function (id) {
    var _activeCategory = null;
    avalon.each(vm.data, function (j, el) {
      avalon.each(el, function (i, elem) {
        if (elem.id == id) {
          _activeCategory = el;
          return false;
        }
      })
    });
    if (!_activeCategory) {
      //this.setDefaultItem();
      //this.setCategoryByItemId(this.id);
      return false;
    }
    this.pid = _activeCategory ? _activeCategory.clientsys : 0;
  },

  onNewModel: function () {
    vmNewModel.open({
      options: this.data,
      pid: this.pid
    });
  },
  onNewModelBySimilar: function () {
    vmNewModel.open({
      options: this.data,
      pid: this.pid,
      id: this.id
    });
  },
  onDelete: function () {
    alert.open({
      title: '',
      content: '是否删除选中模型?'
    }).done(function () {

      avalon.ajax({
        url: '/api/model/'+vm.id+'/del',
        type: 'GET',
        success: function (data, textStatus, XHR) {
          //var _data = vm.data;
          //for (var j in _data) {
          //  for (var i in _data[j].data) {
          //    if (_data[j].data[i].id == vm.id) {
          //      _data[j].data.splice(i, 1);
          //      vm.data = _data;
          //      break;
          //    }
          //  }

          if(data.data==1){
              vm.request();
            vm.setDefaultItem();
            notice.open({
              type: 'success',
              content: '删除成功!'
            })
          }

        },
        error: function () {
          notice.open({
            type: 'danger',
            content: '删除错误!'
          })
        }
      });
    }).fail(function () {
      log('error')
    })
  },
  onAdd: function (data) {
    var _activeCategory = null;
      console.log(data)
    avalon.each(vm.data, function (j, el) {
      if (el.clientsys == data.data) {
        _activeCategory = el;
        return false;
      }
    });
    _activeCategory.list.push(data);
  }
});
vm.request();
module.exports = vm;


/**
 * 新模型
 */
var vmNewModel = avalon.define({
  $id: 'newModel',
  data: {},
  show:false,
  point:'',
  typeConfig: {
    currValue: 0,
    data: [0, 0, 0, 0, 0],
    onSelect: function (v) {
      vmNewModel.data.clientsys = v[0];
    }
  },
  config: {
    title: '新建扩展模型',
    show: false,
    content: require('./newModel.html'),
    ok: function () {
      this.validate.onManual();//手动验证

      // vmNewModel.submit();
      //vmNewModel.validate.onValidateAll();
    }
  },
  submit: function () {
    this.hide();
    avalon.ajax({
      url:  '/api/model/create',
      type: 'POST',
      data: this.data,
      success: function (data) {
        //vm.onAdd(data);
        notice.open({
          type: 'success',
          content: '增加成功!'
        })
          vm.request();
          vm.setDefaultItem();

      },
      error: function () {
        notice.open({
          type: 'danger',
          content: '增加错误!'
        })
      }
    });
  },
  hide: function () {
    this.config.show = false;
  },
  open: function (op) {
    var _data = [];
    avalon.each(op.options, function (j, el) {
      _data.push({
        value: el.clientsys,
        label: el.clientsys
      })
    });
    if (op.id) {
      avalon.ajax({
        url: apiPath + 'info/' + op.id,
        success: function (data, textStatus, XHR) {
          vmNewModel.data = data;
          vmNewModel.typeConfig.currValue = [data.clientsys];
        }
      });
    } else {
      this.data = getNewModelField(op.pid);
    }
    this.typeConfig = {
      currValue: [op.pid],
      data: _data
    };
    this.config.show = true;
  },
  validate: {
    onError: function (reasons) {
      reasons.forEach(function (reason) {
        console.log(reason.getMessage())
      })
      vmNewModel.point=reasons[0].getMessage();
      vmNewModel.show=true;
    },
    onSuccess:function(){
      vmNewModel.show=false;
    },
    onValidateAll: function (reasons) {
      if (reasons.length) {
        console.log('有表单没有通过')
        vmNewModel.point='有表单没有通过';
        vmNewModel.show=true;
      } else {
        console.log('全部通过');
        vmNewModel.point='全部通过';
        vmNewModel.show=true;
        vmNewModel.submit();
        //avalon.ajax({
        //  url:apiPath+'info/'+this.id,//调用修改的接口
        //  data:vmNewModel.data,
        //  success:function(data, textStatus, XHR){
        //    vmNewModel.data = data;
        //  }
        //});
      }
    }
  }
});

function getNewModelField(type) {
  return {
    clientsys: type ? type : 0,
    name: '',
    code: '',
    comment: '',
    creator:'',
    checkService:''
  }
}
