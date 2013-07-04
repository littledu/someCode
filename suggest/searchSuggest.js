/*
 * @components SearchSuggest  input搜索联想组件
 * @author littledu  http://www.cnblogs/littledu   http://www.littledu.in
 * @desc 用于类似google搜索联想结果
 * @调用方式   new SearchSuggest({
 *                 target: 'searchInput',
 *                 serverUrl: 'form.php',
 *                 useJs: false,
 *                 resultNum: 10,
 *                 frameWidth: 360,
 *                 closeBtn: true,
 *                 //toggleFocus: true  已废弃，有等商榷
 *             });
 * @property
 *      target {String || element} (必需) 搜索框的标识
 *
 *      serverUrl {String} (必需) 请求的链接
 *
 *      useJs {Boolean} (可选) [false,true]，默认为false，是ajax请求；true为回调请求
 *
 *      resultNum {Number} (可选) 联想结果的列表长度，默认为10
 *      
 *      frameWidth {Number} (可选) 浮动层宽度，不设默认为与input同宽
 *
 *      closeBtn {Boolean} (可选) 是否有关闭按钮，默认为false
 *              
 *      toggleFocus {Boolean} (可选) 是否作单击搜索框的隐藏默认文字交互，默认为true
 *              
 * @version v1.0
 *
 */

var SearchSuggest = function(){
    this._init.apply(this,arguments);
}

SearchSuggest.prototype = {
    _init: function(c){
        //初始化
        var self = this;
        this.target = typeof c.target === 'string' ? document.getElementById(c.target) : c.target;
        this.serverUrl = c.serverUrl;
        this.useJs = c.useJs || false;
        this.resultNum = c.resultNum || 10;
        this.frameWidth = c.frameWidth || 0;
        this.closeBtn = c.closeBtn || false;
        //this.toggleFocus = c.toggleFocus || false;

        this.resultFrame = null;
        this.resultList = null;
        this.closeDiv = null;
        this.closeSpan = null;

        this.currentIndex = -1;   //用于键盘上下箭头选择

        //当必需参数缺失时，提醒并退出
        if(!this.target || !this.serverUrl){
            alert('参数不正确！');
            return false;
        }

        //创建联想结果浮动层
        this._createFrame();

        this.target.onclick = function(){
            //if(self.toggleFocus){
                (self.target.value == self.target.defaultValue) && (self.target.value = '');
            //}
            self.play();
        };

        this.target.onblur = function(){
            //if(self.toggleFocus){
                (self.target.value == '' || self.target.value == self.target.defaultValue) && (self.target.value = self.target.defaultValue);
            //};
        };

        document.body.onclick = function(){
            self.hide();
            self.currentIndex = -1;  //用于重置键盘上下选择焦点
        };

        //点击关闭
        if(this.closeBtn){
            this.closeSpan.onclick = function(){
                self.hide();
            }
        }

        this.target.onkeyup = function(e){
            var key = e ? e.keyCode : window.event.keyCode;
            
            switch(key){
                case 27 :  //Esc
                    self.hide();
                    break;
                case 38 :   //↑
                    self._hover(self.currentIndex-1,true);
                    break;
                case 40 :   //↓
                    self._hover(self.currentIndex+1,true);
                    break;
                default : 
                    self.play();
            }
            
        }
    },
    //创建联想结果层方法
    _createFrame: function(){
        this.resultFrame = document.createElement('div');
        this.resultList = document.createElement('ul');
        this.resultFrame.className = 'search-result-frame';  //绑定className，有待商榷
        this.resultList.className = 'search-result-list';
        this.resultFrame.appendChild(this.resultList);
        document.body.appendChild(this.resultFrame);

        //创建关闭按钮相关层
        if(this.closeBtn){
            this.closeDiv = document.createElement('div');
            this.closeDiv.className = 'search-close-div';  //绑定className，有待商榷
            this.closeSpan = document.createElement('span');
            this.closeSpan.innerHTML = '关闭';
            this.closeDiv.appendChild(this.closeSpan);
            this.resultFrame.appendChild(this.closeDiv);
        }
         
        //层定位方法
        this._setFramePosition();
    },
    //层定位方法
    _setFramePosition: function(){
        var framePosL = this.target.getBoundingClientRect()['left'];
        var framePosT = this.target.getBoundingClientRect()['top'] + this.target.offsetHeight;
        var frameWidth = this.frameWidth || this.target.offsetWidth-2; //减2是减掉2像素border

        this.resultFrame.style.cssText = 'position:absolute; border:1px solid #ccc; border-top:none; display:none; top:'+framePosT+'px;left:'+framePosL+'px; width:'+frameWidth+'px;';
    },
    //启动方法
    play: function(){
        var value = this.target.value;
        if(value == ''){
            this.hide();
            return false;
        }
        var f = this.useJs ? this._jsRequest : this._ajaxRequest;
        f.call(this,value,this._toggle);
    },
    _hover: function(index,isSelect){
        var self = this;
        var list = this.resultList.getElementsByTagName('li');
        var len = list.length;

        //清空className函数，因多次调用，故封装之
        var clearClass = function(){
            for(var i = 0; i < len; i++){
                list[i].className = '';
            }
        };
        if(list){
            for(var i = 0;i < len; i++){
                list[i].index = i;

                list[i].onmousemove = function(){
                    clearClass();
                    this.className = 'search-hover';  
                    self.currentIndex = this.index;
                };

                list[i].onclick = function(){
                    self.target.value = this.innerHTML;  //有待商榷，当li里的内容不止是结果，还有其他时，也会被一并获取，具体结构具体分析
                    self.hide();

                    //当点击结果时，立即提交
                    var formElement = self.target.parentNode;
                    while(formElement.tagName == 'FORM'){
                        formElement.submit();
                        formElement = formElement.parentNode;
                    }
                }
            }

            if(isSelect){
                clearClass();

                this.target.value = list[index].innerHTML;
                list[index].className = 'search-hover';

                //键盘上下箭头循环选择
                if(this.currentIndex != -1 && list[index].index == 0){
                    this.currentIndex = len;
                }else if(this.currentIndex != len && list[index].index >= len-1){
                    this.currentIndex = -1;
                }else{
                    this.currentIndex= list[index].index;
                }

            }
        }
    },
    //一个判断是要显示结果还是隐藏结果的方法
    _toggle: function(){
        if(this.resultList.childNodes.length != 0){
            this.show();
            this._hover();
        }else{
            this.hide(); 
        }
    },
    //显示
    show: function(){
        this.resultFrame.style.display = 'block';
    },
    //隐藏
    hide: function(){
        this.resultFrame.style.display = 'none';
    },
    //回调发送接收请求方法
    _jsRequest: function(value,callback){
        var self = this;
        //http://s.xxx.com.cn/SearchSuggest_online.php?q=d&jsCallBack=searchResult
        var url = this.serverUrl+'?q='+value+'&app=cp&jsCallback=searchResult';
        var scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = url;
        document.getElementsByTagName('head')[0].appendChild(scriptElement);

        //全局回调函数，接收返回的数据
        window.searchResult = function(data,callback){
            self._requestCallback(data,callback);
        }
    },
    //ajax请求接收方法
    _ajaxRequest: function(value,callback){
        var self = this;
        var url = this.serverUrl+'?q='+value+'&'+Math.random();
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('get',url);
        xhr.onreadystatechange = function(){
            xhr.readyState == 4 && xhr.status == 200 && self._requestCallback(xhr.responseText,callback);
        }
        xhr.send();
    },
    //处理数据，拼接数据方法。与具体返回数据格式有关，这里假设返回的是字符串
    _requestCallback: function(data,callback){
        data = typeof data == 'object' ? data : eval('('+data+')');

        var s = '';
        var len = this.resultNum > len ? len : this.resultNum;
        var num = 0;

        for(var i in data){
            if(num++ == len) break;
            s += '<li>'+data[i]+'</li>';
        }

        this.resultList.innerHTML = s;
        callback && callback.call(this);
    }
}