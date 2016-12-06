/**
 * Created by linmingxiong on 16/9/27.
 */
require('./addField.css');
var vm;
var notice = require('../notice');
var alert = require('../alert');

vm = avalon.define({
    $id: 'field',
    data: [],
    pageConfig: {showPages: 5},
    request: function () {
        avalon.ajax({
            url: '/model/' + this.id + '/field/list',
            type: 'GET',
            success: (data, textStatus, XHR) => {
                data.data.forEach((el) => {
                    el.checked = false
                })
                vm.data = data.data
            }
        });
    },
    allchecked: false,
    checkAll: function (e) {
        var checked = e.target.checked
        vm.data.forEach(function (el) {
            el.checked = checked
        })
    },
    checkOne: function (e) {
        var checked = e.target.checked
        if (checked === false) {
            vm.allchecked = false
        } else {//avalon已经为数组添加了ecma262v5的一些新方法
            vm.allchecked = vm.data.every(function (el) {
                return el.checked
            })
        }
    },
    getChecks: function () {
        var tmpArray = [];
        avalon.each(vm.data, function (index, el) {
            if (el.checked == true) {
                tmpArray.push(el._id);
            }
        })
        return tmpArray;
    },
    delData: function () {
        var delArray = vm.getChecks();
        console.log(delArray)
        if (delArray.length === 0) {
            //若未选中，弹出请选择要删除的数据的对话框
            console.log("请选择要删除的数据");

        }
        else {
            console.log('删除的数据为：' + delArray.join(";"));
            //弹出确定要删除吗？对话框，点击确定则执行vm.delRequest函数，向服务器请求删除操作；取消则关闭对话框。
            alert.open({
                title: ' ',
                content: '<span class="remove-icon">？</span>确认删除?'
            }).done(function () {
                vm.delRequest(delArray);
            }).fail(function () {
                log('error')
            })
            //vm.delRequest(delArray.join(";"));
        }
    },
    delRequest: function (del) {
        avalon.ajax({
            url: '/model/' + vm.id + '/field/' + del[0] + '/del',
            success: function (data, textStatus, XHR) {
                if (data.data == 1) {
                    vm.request();
                    notice.open({
                        type: 'success',
                        content: '删除成功!'
                    })
                }
            },
            error:function(){
                notice.open({
                    type: 'danger',
                    content: '删除错误!'
                })
            }
        });
    },
    editData: function () {
        var editArray = vm.getChecks();
        if (editArray.length !== 1) {
            //若选项个数不等于1，弹出请选择1条待编辑的数据的 对话框
            console.log('请选择1条待编辑的数据');

        }
        else {
            console.log('编辑的数据为：' + editArray);
            //弹出确定要删除吗？对话框，点击确定则执行vm.delRequest函数，向服务器请求删除操作；取消则关闭对话框。
            //vm.editRequest(delArray.join(";"));
        }
    },
    editRequest: function (el) {
        avalon.ajax({
            url: '/model/' + vm.id + '/field/' + el[0].id + '/save',
            success: function (data, textStatus, XHR) {
                vm.data = data;
            }
        });
    },
    addData: function () {
        vmAddFieldDialog.open();
    }

});

/*一级弹层，添加字段 vm*/
var vmAddFieldDialog = avalon.define({
    $id: 'addFieldDialog',
    point: '',
    show: false,
    basicInfo: {
        name: '',
        code: '',
        fGroup: 'remark',
        widgetType: 'text',
        dataType: '字符型',
        notNull: '0',
        default: ''
    },
    interfaceAttr: {
        list: '',
        rule: '',
        conditions: '',
        text: ''
    },
    config: {
        id: 'addfield',
        title: '添加字段',
        show: false,
        showFooter: false,
        mWidth: "760",
        content: require('./addField.html'),
        ok: function () {
            vmAddFieldDialog.submit();
        }
    },

    controlType: {
        data: [{label: '文本框', value: 'text'}, {label: '多行文本框', value: 'multitext'}, {label: '单选框', value: 'radio'}, {label: '多选框', value: 'checkbox'}, {label: '日期选择框', value: 'date'}, {label: '日期时间选择框', value: 'datetime'}, {label: '下拉框', value: 'list'}, {label: '富文本框', value: 'richbox'}],
        currValue: 'text',
        onSelect: function (v) {
            vmAddFieldDialog.basicInfo.widgetType = v;
        }
    },
    dataType: {
        data: [{label: '字符串', value: 'string'}, {label: '短整数', value: 'int'}, {label: '整数', value: 'long'}, {label: '数字', value: 'double'}, {label: '日期', value: 'date'}, {label: '日期时间', value: 'datetime'}, {label: '时间', value: 'time'}],
        currValue: 'string',
        onSelect: function (v) {
            vmAddFieldDialog.basicInfo.dataType = v;
        }
    },
    cancelHandle: function () {
        vmAddFieldDialog.submit();
    },
    submit: function () {
        this.hide()
    },
    hide: function () {
        this.config.show = false;
    },
    open: function () {
        this.config.show = true;
    },
    setList: function () {
        vmsetListDialog.open();
    },
    fieldList: {
        getMethod: "0",
        sysList0: "",
        sysList1: "",
        sysList2: "",
    },
    setRules: function () {
        vmsetRulesDialog.open();
    },
    listShow:false,
    listShowHandle:function(){
        this.listShow=!this.listShow;
    },
    ruleShow:false,
    ruleShowHandle:function(){
        this.ruleShow=!this.ruleShow;
    },
    validate: {
        onError: function (reasons) {
            //console.log(reasons);
            reasons.forEach(function (reason) {
                console.log(reason.getMessage())
            })
            vmAddFieldDialog.point = reasons[0].getMessage();
            vmAddFieldDialog.show = true;
        },
        onSuccess: function () {
            //$(this).siblings('span').text('');
            vmAddFieldDialog.show = false;
        },
        onValidateAll: function (reasons) {
            if (reasons.length) {
                console.log('有表单没有通过')
                vmAddFieldDialog.point = '有表单没有通过';
                vmAddFieldDialog.show = true;
            } else {
                console.log('全部通过');
                vmAddFieldDialog.point = '全部通过';
                vmAddFieldDialog.show = true;
                avalon.ajax({
                    url: '/model/' + vm.id + '/field/create',//调用修改的接口
                    data: vmAddFieldDialog.data,
                    success: function (data, textStatus, XHR) {
                        vmAddFieldDialog.data = data;
                    }
                });
            }
        }
    }

});
/*二级弹层，设置选项列表 vm*/
var vmsetListDialog = avalon.define({
    $id: 'setListDialog',
    config: {
        id: 'setlist',
        title: '字段选项',
        show: false,
        mWidth: "600",
        content: require('./setList.html'),
        ok: function () {

            vmsetListDialog.submit();
        }
    },
    hide: function () {
        this.config.show = false;
    },
    open: function () {
        this.config.show = true;
    },
    fieldList: {
        getMethod: "0",
        sysList0: "",
        sysList1: "",
        sysList2: "",
    },
    sysCode: {
        data: [{label: '111', value: 1}, {label: '222', value: 2}, {label: '333', value: 3}],
        currValue: 2,
        onSelect: function (v) {
            vmsetListDialog.fieldList.sysList0 = v;
        }
    }
});
/*二级弹层，设置校验规则 vm*/
var vmsetRulesDialog = avalon.define({
    $id: 'setRulesDialog',
    config: {
        id: 'setrules',
        title: '校验规则',
        show: false,
        content: require('./setRules.html'),
        ok: function () {
            vmsetRulesDialog.submit();
        }
    },
    commonRulesA: [],
    commonRulesB: [],
    advanceRules: [],
    js: "",
    reg: "",
    length: "",
    getCommonRules: function () {
        console.log(vmsetRulesDialog.commonRulesA.sort().join(";"));
    },
    hide: function () {
        this.config.show = false;
    },
    open: function () {
        this.config.show = true;
    }
});

module.exports = vm;