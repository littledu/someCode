/*
 * @components Focus 焦点图
 * @author littledu  http://www.cnblogs/littledu   http://www.littledu.in
 * @desc 用于图片切换；
 * @调用方式   new Focus({id:'Jfocus',effect:'slide', direction:'top', scrollSize:170,autoPlay:true,control:true,delay:2000});
 * @property
 * 		id：{String}：焦点图的入口标识
 *
 * 		effect:{String} (可选) ["base","fade","slide"] 切换方式  默认为base
 *
 * 	    direction: {String} (可选) 当effect为slide时可用  ["left","up"]: 方向参数。默认为'left';

 * 		scrollSize: {Number} (必选) 切换的范围大小
 *
 * 		autoPlay: {Number} (可选) 自动切换  默认为false不开启
 *              
 * 		control: {Number} (可选) 上一张，下一张控制按钮，默认没有，有时必需设置为true
 *              
 *      delay: {Number} (可选)  自动切换时间间隔，默认为2s
 * @version v1.0
 *
 */




var Focus = function(options){ this._init(options);}

Focus.prototype = {
    _init : function(options){                     //初始化
               var _this = this;
               this._setOptions(options);          //设置参数
               var c = this.config;

               //获取需要的元素节点
               this.target = document.getElementById(c.id);
               this.wraper = document.getElementById(c.id+'-content');         //内容层
               this.contentList = this.wraper.getElementsByTagName('li');      //具体内容
               this.btns = document.getElementById(c.id+'-btn').getElementsByTagName('li');   //按钮

               //计时器句柄
               this.timer = null;             
               this.autoTimer = null;
               this.alphaTimer = null;

               //切换的当前位置
               this.curIndex = 0;

               if(c.control){  //如果上一张，下一张，则绑定相应事件  PS：control这个名字感觉取得不好，但又想不到更加好的
                    this.prevBtn = document.getElementById(c.id+'-prev');
                    this.nextBtn = document.getElementById(c.id+'-next');

                    this.prevBtn.onclick = function(){
                        _this.prev();
                    }

                    this.nextBtn.onclick = function(){
                        _this.next();
                    }

               }

               if(c.autoPlay){     //开启了自动切换，当鼠标移入时，停止自动切换，移出时开启自动切换
                   this.play(0);

                   this.autoTimer = setInterval(function(){ _this.next();},c.delay);

                   this.wraper.onmouseover = function(){
                        _this.autoTimer && clearInterval(_this.autoTimer);
                   }

                   this.wraper.onmouseout = function(){
                        _this.autoTimer = setInterval(function(){ _this.next();},c.delay);
                   }
               }

               //遍历，鼠标移入1234等按钮时切换
               for(var i = 0, len = this.btns.length; i < len; i++){
                    this.btns[i].index = i;
                    this.btns[i].onmouseover = function(){
                        _this.autoTimer && clearInterval(_this.autoTimer);    //停止自动切换
                        _this.curIndex = this.index;
                        _this.play();
                    }
               }
           },
    _setOptions : function(options){           //设置参数方法
                    this.config = {
                        effect : 'base',
                        direction : 'left',
                        autoPlay : false,
                        scrollSize:0,
                        delay : 2000,
                        control : false
                    };
                    this._extend(this.config,options);
                 },
    _extend : function(config,source){
                for(var proterty in source){
                    config[proterty] = source[proterty];
                }
             },
    play : function(){     //切换方法入口
                this._btnToggle();          
                switch(this.config.effect){
                    case 'fade' : 
                        this._fadeToggle();
                        break;
                    case 'slide' :
                        this._slideToggle();
                        break;
                    default : 
                        this._baseToggle();
                }
            },
    _btnToggle : function(){             //1234等按钮的切换方法
                for(var i = 0,len = this.btns.length; i < len; i++){
                    this.btns[i].className = '';
                }
                this.btns[this.curIndex].className = 'current';
             },
    _slideToggle : function(){             //移动的切换方法
                var _this = this;
                clearInterval(_this.timer);
                var target = -(this.config.scrollSize * this.curIndex);
                
                this.timer = setInterval(function(){
                    var curStyle = parseInt(_this.wraper.currentStyle ? _this.wraper.currentStyle[_this.config.direction] : getComputedStyle(_this.wraper,null)[_this.config.direction]);
                    var speed = (target - curStyle) / 5;
                    speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                    curStyle == target ? clearInterval(_this.timer) : _this.wraper.style[_this.config.direction] = curStyle + speed + 'px';
                            
                 },30);
             },
    _fadeToggle : function(){       //透明度切换方法
                 var _this = this;
                 for(var i = 0, len = this.contentList.length; i < len; i++){
                     this.contentList[i].style.opacity = 0;
                     this.contentList[i].style.filter = 'alpha(opacity=0)';
                 }
                 this._btnToggle();
                 var alpha = 0;
                 clearInterval(_this.alphaTimer);
                 this.alphaTimer = setInterval(function(){
                            alpha += 2;
                            alpha > 100 && (alpha = 100);
                            _this.contentList[_this.curIndex].style.opacity = alpha / 100;
                            _this.contentList[_this.curIndex].style.filter = 'alpha(opacity='+ alpha +')';
                            alpha == 100 && clearInterval(_this.alphaTimer);
                         },20);
              },
    _baseToggle : function(){     //直接切换方法，适用于tab切换
                    for(var i = 0, len = this.contentList.length; i < len; i++){
                        this.contentList[i].style.display = 'none';
                    }
                    this.contentList[this.curIndex].style.display = 'block';
                 },
    prev : function(){    //上一张
               this.curIndex--;
               (this.curIndex < 0) && (this.curIndex = this.btns.length-1);
               this.play(this.curIndex);
           },
    next : function(){    //下一张
               this.curIndex++;
               (this.curIndex == this.btns.length) && (this.curIndex = 0);
               this.play(this.curIndex);
           }
}
