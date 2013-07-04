/*
 * @components efix 元素固定组件
 * @author littledu 410491325@qq.com   
 * @desc 用于页面上元素不跟随滚动条的滚动而滚动
 * @property
 * 		id：{String}：想要固定的元素id
 *
 *      isScroll: {Boolean} 是滚动条滚到时fixed，还是直接设置fixed,默认为false
 *
 *      top : {Number} 当isScroll为false时，设置fixed元素的top位置
 *
 *      left : {Number} 当isScroll为false时，设置fixed元素的left位置
 *
 *      marginTop : {Number} 当isScroll为true时，设置fixed元素距离顶部的距离
 *
 *      onresize : {Function} 当isScroll为false时，需要设置一些特殊需求，如靠右边的对联广告，右下角的弹出层，需重设resize
 * @version v1.0
 *
 * 关于offsetParent:此属性标准是会返回离元素最近的定位祖先元素，在IE678下，则是返回离元素最近的设置有能激活hasLayout的祖先元素，会影响元素的offsetLeft/offsetTop但不影响top，left；
 *
 * IE67下，dom元素的改变会触发window.onresize事件，解决方法就是对比resize前后的可视窗口大小，以识别真正的window.onresize
 */


function efix(options){ this.init(options);}

efix.prototype = {
    init : function(options){
               var self = this;
               this.config = options;
               this.fixTimer = false;  //一个全局勾子，让动态表达式等只执行一次

               //IE67下，dom元素的改变会触发window.onresize事件，解决方法就是对比resize前后的可视窗口大小，以识别真正的window.onresize，故这里保存resize前的可视窗口大小
               this.saveWidth = document.documentElement.clientWidth;
               this.saveHeight = document.documentElement.clientHeight;
               
               this.id = this.config.id;
               this.target = document.getElementById(this.id);
               
               this.marginTop = this.config.marginTop || 0;                //与顶部的距离
               this.top = this.config.top || 0;
               this.left = this.config.left || 0;
               this.curTop = this.target.getBoundingClientRect().top - this.marginTop;       //获取元素fixed前的top位置  作用：作为fixed开始时判断
               this.curWidth = parseInt(this.target.currentStyle ? this.target.currentStyle['width'] : getComputedStyle(this.target,null)['width']);//元素fixed后会失去宽度高度，保存fixed前的宽度
               this.isIE6 = !-[1,] && !window.XMLHttpRequest;         //判断IE6
               this.saveStyle = this.target.style.cssText || '';      //如果元素原来有内嵌的style，保存，在后面重置margin时把原来的style给回元素

               //解决IE6下闪动问题，只添加一次
               if(this.isIE6 && document.body.currentStyle.backgroundAttachment !== 'fixed'){
                   var ebody = document.body;
                   ebody.style.backgroundImage = 'url(about:blank)';
                   ebody.style.backgroundAttachment = 'fixed';
               }

               this.setPosition();


               //当元素本身有定位时，isScroll为true的元素不需要resize
               var isPosition = this.target.currentStyle ? this.target.currentStyle['position'] : getComputedStyle(this.target,null)['position'];
               if(isPosition == 'static'){
                   this.addEvent(window,'resize',function(){ self.fixResize(); });
               }

               if(this.config.isScroll){
                    //创建fixed元素的副本，以保证元素fixed后文档结构不变
                    this.createCopyElement();
                    this.addEvent(window,'scroll',function(){ self.fixScroll(); });
               }else{
                    document.body.appendChild(this.target);
                    this.fixStatic();
               }
           },

    /*
     * 重设fixed元素的位置
     *
     * 1.IE67下，dom元素的改变会触发window.onresize事件，故先对比下前后的窗口大小值，以识别真正的window.onresize事件
     * 2.在进行fixed时，改变窗口大小，需重新获取fixed元素的位置，但fixed时，位置是不变的，故先将元素置为static，再获取正确的位置值
     * */
    fixResize : function(){
                    if(this.saveWidth != document.documentElement.clientWidth || this.saveHeight != document.documentElement.clientHeight){
                        if(this.config.isScroll) {
                            this.target.style.position = 'static';
                            this.setPosition(); 
                            this.fixTimer = false;
                            this.fixScroll();
                        }else{
                            this.config.onresize && this.config.onresize.apply(this);
                        }
                    }
                    this.saveWidth = document.documentElement.clientWidth;
                    this.saveHeight = document.documentElement.clientHeight;
                },

    /*
     * 设置fixed元素正确的位置值
     * */
    setPosition : function(){
                      this.positionParent = this.target.offsetParent;        //保存具有定位或haslayout的祖先元素，方便寻找并设置正确的定位祖先元素
                      if(this.isIE6 && this.searchPosition()){
                           //IE6下，如果其父元素有定位时，获取元素fixed后的left值和需要减掉的定位父元素的top值
                           this.curLeft = this.target.getBoundingClientRect().left - this.positionParent.getBoundingClientRect().left;
                           window[this.id+'nTop'] = this.positionParent.getBoundingClientRect().top - 2 - this.marginTop
                       }else{
                           this.curLeft = this.target.getBoundingClientRect().left - 2;
                           window[this.id+'nTop'] = -this.marginTop;
                      }
                  },

    /*
     * 寻找祖先元素是否有定位
     *
     * offsetParent能指向有定位的，或者有haslayout属性的元素，故通过offsetParent往上查找
     * */
    searchPosition : function(){          
                    while(this.positionParent.nodeName.toLowerCase() != 'body' && this.positionParent.nodeName.toLowerCase() != 'html'){
                        var isPosition = this.positionParent.currentStyle ? this.positionParent.currentStyle['position'] : getComputedStyle(this.positionParent,null)['position'];
                        if(isPosition == 'static'){
                            this.positionParent = this.positionParent.offsetParent;
                            continue;
                        }else{
                            return true;
                        }
                    }
                    return false;
                  },
    /*
     * 固定定位的方法(isScorll为false)
     *
     * */
    fixStatic : function(){
                    if(this.isIE6){
                        var top = this.top - document.body.scrollTop;
                        this.target.style.position = 'absolute';
                        this.target.style.left = this.left + 'px';
                        this.target.style.setExpression('top','eval(document.documentElement.scrollTop + ' + top + ') + "px"');
                        this.setCommonStyle();
                    }else{
                        this.target.style.position = 'fixed';
                        this.target.style.left = this.left + 'px';
                        this.target.style.top = this.top+ 'px';
                        this.setCommonStyle();
                    }
                },
    /*
     * 固定定位的方法(isScroll为true)
     *
     * 当滚动条高度等于元素位置时，开始fixed，原本想通过cssText一次性设置，但实践结果是在用了cssText时再用setExpression，有冲突，导致失效，故只能一个个style设置
     * */
    fixScroll : function(){
                    var scrollT = document.body.scrollTop || document.documentElement.scrollTop;

                    if(scrollT > this.curTop){
                        this.fixTimer ? null : this.setScrollFix();
                    }else{
                        this.target.style.cssText = this.saveStyle;
                        this.copyElement.style.display = 'none';
                        this.fixTimer = null;
                    }

                },
    /*
     * 设置固定定位值(isScroll为true的情况)
     *
     * 由于不想拖动滚动条时，一直重复执行设置值，故分离成一个方法，并设置fixTimer进行判断是否执行过
     * */
    setScrollFix : function(){
                if(this.isIE6){
                    this.target.style.position = 'absolute';
                    this.target.style.left = this.curLeft + 'px';
                    this.target.style.setExpression('top','eval(document.documentElement.scrollTop) - window[this.id+"nTop"] +"px"');
                    this.copyElement.style.display = 'block';       //显示副本，并从视觉上隐藏
                    this.copyElement.style.visibility = 'hidden';
                    this.setCommonStyle();
                    this.fixTimer = true;
                }else{
                    this.target.style.position = 'fixed';
                    this.target.style.left = this.curLeft + 2 + 'px';
                    this.target.style.top = this.marginTop + 'px';
                    this.copyElement.style.display = 'block';       //显示副本，并从视觉上隐藏
                    this.copyElement.style.visibility = 'hidden';
                    this.setCommonStyle();
                    this.fixTimer = true;
                }
             },

    /*
     * 设置公共样式
     *
     * 由于多次用到，故做一方法
     * */
    setCommonStyle : function(){
                      this.target.style.width = this.curWidth + 'px';
                      this.target.style.zIndex = 9999;                //让fixed元素在最前
                      this.target.style.margin = 0;                   //防止margin影响定位
                  },
    /*
     * 拷贝fixed实例
     *
     * fixed后，脱离文档流后，后面的元素会顶上来补位置，为解决这种情况，故将fixed复制一份，并隐藏，当开始fixed时，切换显示
     * */
    createCopyElement : function(){
                        this.copyElement = this.target.cloneNode(false);
                        this.copyElement.id = '';
                        this.copyElement.style.width = this.curWidth + 'px';
                        this.copyElement.style.height = this.target.offsetHeight + 'px';
                        this.target.parentNode.insertBefore(this.copyElement,this.target);
                        this.copyElement.style.display = 'none';
                    },

    /*
     * 绑定事件方法
     * */
    addEvent : function (ele, type, fnHandler) {
        return ele.addEventListener ? ele.addEventListener(type, fnHandler, false) : ele.attachEvent('on' + type, fnHandler);
    }
}


