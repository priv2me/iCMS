define("user", function(require) {
    var utils = require("utils"),
    API = require("api"),
    User = {};
    return $.extend(User, {
        NOAVATAR: function(img) {
            img.src = iCMS.CONFIG.PUBLIC+'/ui/avatar.gif';
        },
        NOCOVER: function(img,type) {
            var name = 'coverpic';
            if(type=="m"){
                name = 'm_coverpic';
            }
            img.src = iCMS.CONFIG.PUBLIC+'/ui/'+name+'.jpg';
        },
        STATUS: function($param, SUCCESS, FAIL) {
            var me = this;
            $.get(API.url('user', '&do=data'), $param, function(ret) {
                if (ret.code) {
                    User.data = ret;
                }
                utils.callback(ret, SUCCESS, FAIL, me);
            }, 'json');
        },
        AUTH: function() {
            var cookie = require("cookie");
            return cookie.get(iCMS.CONFIG.AUTH) ? true : false;
        },
        LOGIN: function() {

        },
        LOGOUT: function($param, SUCCESS, FAIL) {
            var me = this;
            $.get(API.url('user', "&do=logout"), $param, function(ret) {
                utils.callback(ret, SUCCESS, FAIL, me);
            }, 'json');
        },
        FOLLOW: function(a,SUCCESS,FAIL) {
            var me = this;
            // var auth = this.AUTH();
            // if (!auth) {
            //   return utils.__callback(FAIL,me);
            // }
            var auth = this.AUTH();
            if (!auth) {
              return this.LOGIN();
            }
            var data = $(a).attr('i').replace('follow:','').split(":");
            var $param = {'uid':data[0],'follow':data[1],'action':'follow'}
            $.post(API.url('user'), $param, function(ret) {
                utils.callback(ret,SUCCESS,FAIL,me,$param);
            }, 'json');
        },
        UCARD:function(){
            var UI = require("ui"),$poshytip = require("poshytip");
            $("[i^='ucard']").poshytip({
                idName:'iCMS-UCARD',className:'iCMS_UI_TOOLTIP',
                alignTo:'target',alignX:'center',
                offsetX:0,offsetY:5,fade:false,slide:false,
                content: function(update) {
                    var uid = $(this).attr('i').replace('ucard:','');
                    if(uid){
                        $.get(API.url('user', "&do=ucard"),{'uid':uid},update);
                    }
                    return UI.widget.ucard;
                }
            });
        },
        PM:function(a){
            var me = this;
            var auth = this.AUTH();
            if (!auth) {
              return this.LOGIN();
            }
            var UI = require("ui");

            var $this  = $(a),
                box    = document.getElementById("iCMS-PM-DIALOG"),
                dialog = UI.dialog({
                    title: '发送私信',
                    quickClose: false,width:"auto",height:"auto",
                    content:box
                }),
                inbox  = $this.attr('href'),
                data   = API.param(a),
                content = $("[name='content']", box).val('');
            $(".pm_warnmsg", box).hide();
            $('.pm_uname', box).text(data.name);
            if(inbox){
                $('.pm_inbox', box).attr("href",inbox);
            }else{
                $('.pm_inbox', box).hide();
            }
            $('.cancel', box).click(function(event) {
                event.preventDefault();
                dialog.remove();
            });
            $('[name="send"]', box).click(function(event) {
                event.preventDefault();
                data.content = content.val();
                if (!data.content) {
                    content.focus();
                    $(".pm_warnmsg", box).show();
                    return false;
                }
                data.action = 'pm';
                $.post(API.url('user'), data, function(c) {
                    dialog.remove();
                    UI.alert(c.msg,c.code);
                }, 'json');
            });
        },
        REPORT:function(a) {
            var me = this;
            var auth = this.AUTH();
            if (!auth) {
              return this.LOGIN();
            }
            var UI = require("ui");

            var $this = $(a),
            _title    = $this.attr('title')||'为什么举报这个评论?',
            box       = document.getElementById("iCMS-REPORT-DIALOG"),
            dialog    = UI.dialog({
                title: _title,content:box,
                quickClose: false,width:"auto",height:"auto"
            });

            $("li", box).click(function(event) {
                event.preventDefault();
                $("li", box).removeClass('checked');
                $(this).addClass('checked');
                //$("[name='reason']",box).prop("checked",false);
                $("[name='reason']",this).prop("checked",true);
            });
            $('.cancel', box).click(function(event) {
                event.preventDefault();
                dialog.remove();
            });
            $('[name="ok"]', box).click(function(event) {
                event.preventDefault();
                var data    = API.param($this),
                content     = $("[name='content']", box);
                data.reason = $("[name='reason']:checked", box).val();
                if (!data.reason) {
                    UI.alert("请选择举报的原因");
                    return false;
                }
                if (data.reason == "0") {
                    data.content = content.val();
                    if (!data.content) {
                        UI.alert("请填写举报的原因");
                        return false;
                    }
                }
                data.action = 'report';
                $.post(API.url('user'), data, function(c) {
                    content.val('');
                    $("li", box).removeClass('checked');
                    $("[name='reason']", box).removeAttr('checked');
                    UI.alert(c.msg,c.code);
                    if(c.code){
                        dialog.remove();
                    }
                }, 'json');
            });
        },


    });
});