/*
 * @components Focus ����ͼ
 * @author littledu  http://www.cnblogs/littledu   http://www.littledu.in
 * @desc ����ͼƬ�л���
 * @���÷�ʽ   new Focus({id:'Jfocus',effect:'slide', direction:'top', scrollSize:170,autoPlay:true,control:true,delay:2000});
 * @property
 * 		id��{String}������ͼ����ڱ�ʶ
 *
 * 		effect:{String} (��ѡ) ["base","fade","slide"] �л���ʽ  Ĭ��Ϊbase
 *
 * 	    direction: {String} (��ѡ) ��effectΪslideʱ����  ["left","up"]: ���������Ĭ��Ϊ'left';

 * 		scrollSize: {Number} (��ѡ) �л��ķ�Χ��С
 *
 * 		autoPlay: {Number} (��ѡ) �Զ��л�  Ĭ��Ϊfalse������
 *              
 * 		control: {Number} (��ѡ) ��һ�ţ���һ�ſ��ư�ť��Ĭ��û�У���ʱ��������Ϊtrue
 *              
 *      delay: {Number} (��ѡ)  �Զ��л�ʱ������Ĭ��Ϊ2s
 * @version v1.0
 *
 */




var Focus = function(options){ this._init(options);}

Focus.prototype = {
    _init : function(options){                     //��ʼ��
               var _this = this;
               this._setOptions(options);          //���ò���
               var c = this.config;

               //��ȡ��Ҫ��Ԫ�ؽڵ�
               this.target = document.getElementById(c.id);
               this.wraper = document.getElementById(c.id+'-content');         //���ݲ�
               this.contentList = this.wraper.getElementsByTagName('li');      //��������
               this.btns = document.getElementById(c.id+'-btn').getElementsByTagName('li');   //��ť

               //��ʱ�����
               this.timer = null;             
               this.autoTimer = null;
               this.alphaTimer = null;

               //�л��ĵ�ǰλ��
               this.curIndex = 0;

               if(c.control){  //�����һ�ţ���һ�ţ������Ӧ�¼�  PS��control������ָо�ȡ�ò��ã������벻�����Ӻõ�
                    this.prevBtn = document.getElementById(c.id+'-prev');
                    this.nextBtn = document.getElementById(c.id+'-next');

                    this.prevBtn.onclick = function(){
                        _this.prev();
                    }

                    this.nextBtn.onclick = function(){
                        _this.next();
                    }

               }

               if(c.autoPlay){     //�������Զ��л������������ʱ��ֹͣ�Զ��л����Ƴ�ʱ�����Զ��л�
                   this.play(0);

                   this.autoTimer = setInterval(function(){ _this.next();},c.delay);

                   this.wraper.onmouseover = function(){
                        _this.autoTimer && clearInterval(_this.autoTimer);
                   }

                   this.wraper.onmouseout = function(){
                        _this.autoTimer = setInterval(function(){ _this.next();},c.delay);
                   }
               }

               //�������������1234�Ȱ�ťʱ�л�
               for(var i = 0, len = this.btns.length; i < len; i++){
                    this.btns[i].index = i;
                    this.btns[i].onmouseover = function(){
                        _this.autoTimer && clearInterval(_this.autoTimer);    //ֹͣ�Զ��л�
                        _this.curIndex = this.index;
                        _this.play();
                    }
               }
           },
    _setOptions : function(options){           //���ò�������
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
    play : function(){     //�л��������
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
    _btnToggle : function(){             //1234�Ȱ�ť���л�����
                for(var i = 0,len = this.btns.length; i < len; i++){
                    this.btns[i].className = '';
                }
                this.btns[this.curIndex].className = 'current';
             },
    _slideToggle : function(){             //�ƶ����л�����
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
    _fadeToggle : function(){       //͸�����л�����
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
    _baseToggle : function(){     //ֱ���л�������������tab�л�
                    for(var i = 0, len = this.contentList.length; i < len; i++){
                        this.contentList[i].style.display = 'none';
                    }
                    this.contentList[this.curIndex].style.display = 'block';
                 },
    prev : function(){    //��һ��
               this.curIndex--;
               (this.curIndex < 0) && (this.curIndex = this.btns.length-1);
               this.play(this.curIndex);
           },
    next : function(){    //��һ��
               this.curIndex++;
               (this.curIndex == this.btns.length) && (this.curIndex = 0);
               this.play(this.curIndex);
           }
}
