/**
 * Created by ff on 16/9/27.
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
            error: function () {
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
            vm.FindRequest(editArray[0]);
            vmAddFieldDialog.open();
            vmAddFieldDialog.isEdit=true;
        }
    },
    FindRequest: function (el) {
        avalon.ajax({
            url: '/model/' + vm.id + '/field/' + el,
            type:'GET',
            success: function (data, textStatus, XHR) {
                vmAddFieldDialog.data = data.data;
                vmAddFieldDialog._id=data.data._id;
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
    isEdit:false,
    //data:{},
    //basicInfo: {
    //    name: '',
    //    code: '',
    //    fGroup: 'remark',
    //    widgetType: 'text',
    //    dataType: '字符型',
    //    notNull: '0',
    //    defaultValue: ''
    //},
    //interfaceAttr: {
    //    options: '',
    //    checkRule: '',
    //    length: '',
    //    comment: ''
    //},
    _id:'',
    data: {
        name: '',
        code: '',
        widgetType: 'text',
        dataType: 'string',
        notNull: 'n',
        defaultValue: '',
        options: '',
        checkRule: '',
        length: '',
        comment: '',
        base: '',
        creator: 'ff'
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

    widgetType: {
        data: [{label: '文本框', value: 'text'}, {label: '多行文本框', value: 'multitext'}, {
            label: '单选框',
            value: 'radio'
        }, {label: '多选框', value: 'checkbox'}, {label: '日期选择框', value: 'date'}, {
            label: '日期时间选择框',
            value: 'datetime'
        }, {label: '下拉框', value: 'list'}, {label: '富文本框', value: 'richbox'}],
        currValue: 'text',
        onSelect: function (v) {
            vmAddFieldDialog.data.widgetType = v;
        }
    },
    dataType: {
        data: [{label: '字符串', value: 'string'}, {label: '短整数', value: 'int'}, {
            label: '整数',
            value: 'long'
        }, {label: '数字', value: 'double'}, {label: '日期', value: 'date'}, {
            label: '日期时间',
            value: 'datetime'
        }, {label: '时间', value: 'time'}],
        currValue: 'string',
        onSelect: function (v) {
            vmAddFieldDialog.data.dataType = v;
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
        getMethod: "input",
        sysListinput: ""
    },
    listOkHandle: function () {
        this.data.options = this.fieldList.getMethod + ':' + this.fieldList.sysListinput
    },
    listCancelHandle: function () {
        this.data.options = ''
    },
    setRules: function () {
        vmsetRulesDialog.open();
    },
    listShow: false,
    listShowHandle: function () {
        this.listShow = !this.listShow;
    },
    ruleShow: false,
    ruleShowHandle: function () {
        this.ruleShow = !this.ruleShow;
    },
    rulelist: {
        internal: [],
        Regex: '',
        Script: '',
        scriptChecked: '',
        regChecked: ''
    },
    scriptCheckedfn: function (e) {
        if (!e.target.checked) {
            this.rulelist.Script = ''
        }
        console.log(this.rulelist.Script)

    },
    regCheckedfn: function (e) {
        if (!e.target.checked) {
            this.rulelist.Regex = ''
        }
        console.log(this.rulelist.Regex)

    },
    ruleOkHandle: function () {
        console.log(this.rulelist.internal.join('&&') + '&&Regex=' + this.rulelist.Regex + '&&Script=' + this.rulelist.Script);
        this.data.checkRule = this.rulelist.internal.join('&&') + '&&Regex=' + this.rulelist.Regex + '&&Script=' + this.rulelist.Script;
    },
    ruleCancelHandle: function () {
        console.log();
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
                var _url,_data;
                if(vmAddFieldDialog.isEdit){
                    _url='/model/' + vm.id + '/field/create';
                    _data=delete vmAddFieldDialog.creator;
                    _data['modifier']='dd';

                }else{
                    _url='/model/' + vm.id + '/field/'+vmAddFieldDialog._id+'/save'//需要查询接口返回的字段id
                    _data=delete vmAddFieldDialog.modifier;
                    _data['creator']='ff';
                }
                avalon.ajax({
                    url:_url ,//调用创建的接口
                    type:'POST',
                    data: vmAddFieldDialog.data,
                    success: function (data, textStatus, XHR) {
                        //vmAddFieldDialog.data = data;

                        vmAddFieldDialog.config.show = false;
                        notice.open({
                            type: 'success',
                            content: '添加成功!'
                        })
                    },
                    error: function () {
                        notice.open({
                            type: 'error',
                            content: '添加失败!'
                        })
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