/**
 * Created by linmingxiong on 16/9/27.
 */
require('./style.css');
var notice = require('../notice');

var vm = avalon.define({
    $id: 'info',
    data: {},
    id: 0,
    point: '',
    show: false,
    request: function () {
        avalon.ajax({
            url: '/api/model/'+vm.id,
            success: function (data, textStatus, XHR) {
                var _data = data.data;
                delete _data.createTime
                delete _data.creator
                delete _data.modifyTime
                vm.data = _data;
            }
        });
    },
    validate: {
        onError: function (reasons) {
            //console.log(reasons);
            reasons.forEach(function (reason) {
                console.log(reason.getMessage())
            })
            vm.point = reasons[0].getMessage();
            vm.show = true;
        },
        onSuccess: function () {
            //$(this).siblings('span').text('');
            vm.show = false;
        },
        onValidateAll: function (reasons) {
            if (reasons.length) {
                console.log('有表单没有通过')
                vm.point = '有表单没有通过';
                vm.show = true;
            } else {
                console.log('全部通过');
                vm.point = '全部通过';
                vm.show = true;
                avalon.ajax({
                    url: '/api/model/'+vm.id+'/save',//调用修改的接口
                    type:'POST',
                    data: vm.data,
                    success: function (data, textStatus, XHR) {
                        notice.open({
                            type: 'success',
                            content: '修改成功!'
                        })
                        //vm.data = data;
                    }
                });
            }
        }
    },
    inputSucess: {
        name: 'success',
        iconshow: true,
        lableShow: false,
        inputParCol: ['col-sm-12'],
        type: 'success'
    },
    input1: {
        name: 'error',
        iconshow: true,
        placeholder: '信息错误',
        inputType: 'password',
        type: 'error'
    },
    input2: {
        isWarn: true,
        iconshow: true
    },
    input3: {
        name: '密 码',
        inputType: 'password'
    }
});
module.exports = vm;

