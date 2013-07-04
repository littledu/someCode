/*
 * @components SliderPCgames 游戏网大首页焦点图(仿17173.com)
 * @author 杜光敏
 * @desc 用于图片切换,依赖于PJ库，但由于使用范围小，故不准备封装成插件
 * @调用方式   
 * new Slider17173({
        targets: pc.getElems('#slide08 .pics li'),
        controls: pc.getElems('#slide08_control .slide li'),
        nextBtn: pc.getElem('#slide08_control .rbt'),
        prevBtn: pc.getElem('#slide08_control .lbt'),
        shade: pc.getElem('#lightwrap'),
        thumbScrollWidth: 77,
        stay: 2000,
        lazy: true
    });
 * @property
 *      targets：{NodeLists}：焦点图的切换图片
 *
 *      control:{NodeLists} 控制缩略图
 *
 *      nextBtn: {Element} 右切换

 *      prevBtn: {Element} 左切换
 *
 *      shade: {Element} (可选) 滑动的当前缩略图层
 *              
 *      thumbScrollWidth: {Number} 缩略图滚动宽度
 *              
 *      stay: {Number} (可选)  自动切换时间间隔，默认为2s
 *
 *      lazy: { Boolean } (可选) 按需加载
 *
 * @version v1.0
 *
 * 详细使用可参考游戏网大首页大焦点图 http://www.pcgames.com.cn/
 * 由于时间关系，后续尚有图片按需加载，滚动完成时的回调等功能未添加，但满足基本需求
 *
 * 2013.2.18 新增图片按需加载功能
 */
;(function(){
    function SliderPCgames(config){
        this.init(config);
    }
    SliderPCgames.prototype = {
        init: function(config){
            var self = this;
            this.targets = config.targets;  //切换的目标
            this.controls = config.controls;  //控制按钮
            this.control = this.controls[0].parentNode;  
            this.nextBtn = config.nextBtn;   //下一张切换按钮
            this.prevBtn = config.prevBtn;   //上一张切换按钮
            this.stay = config.stay || 2000; //自动播放时间，默认2秒
            this.shade = config.shade;       //遮罩层
            this.thumbScrollWidth = config.thumbScrollWidth;  //缩略图滚动的宽度
            //this.thumbShowNum = config.thumbShowNum - 1;      //显示区域的缩略图张数，为方便控制这里直接减1获取index
            this.autoPlay = config.autoPlay || true;          //默认自动播放
            this.autoPlayTimer = null;                        //自动播放的控制句柄
            this.clickTimer = null;                               //左右切换的控制句柄
            this.lazy = config.lazy || false;
            this.prevPicIndex = this.curPicIndex = this.thumbPrevIndex = this.thumbPos = this.scrollPos = 0;
            
            //缩略图无缝滚动
            this.control.innerHTML += this.control.innerHTML; //暂没考虑设置宽度以容纳多一倍的内容，需手动设置
            this.controlLen = this.controls.length;           //保存实际缩略图个数
            this.realControlLenIndex = this.controlLen -1;    //后面需要直接-1
            this.controls = pc.getElems('li',this.control);   //重新获取复制后的缩略图，有待优化


            // 需要层叠做透明度切换
            pc.setStyle(self.targets[0].parentNode, 'position', 'relative'); 
            pc.each(self.targets, function(elem, i){
                pc.setData(elem, 'index', i);
                pc.setStyle(elem,{opacity: 0, position: 'absolute', zIndex: i});
            });
            pc.setStyle(self.targets[0],{opacity: 1,zIndex: self.controlLen});

            //右切换
            pc.addEvent(this.nextBtn,'click',function(){
                clearTimeout(self.clickTimer);
                self.clickTimer = setTimeout(function(){
                    self.next();
                }, 200);
            });

            //左切换
            pc.addEvent(this.prevBtn,'click',function(){
                clearTimeout(self.clickTimer);
                self.clickTimer = setTimeout(function(){
                    self.prev();
                }, 200);
                
            })

            //为缩略图绑定单击切换事件
            pc.each(self.controls,function(elem,i){
                pc.addEvent(elem,'click',function(e){

                    self.setPic(i);  //切换图片

                    self.setShadePos(i);  //切换当前缩略图,这里有问题

                    self.setThumbPrevIndex(i);

                    e.preventDefault();    //阻止默认动作
                });
            });

            //自动切换
            if(this.autoPlay){
                this.startAutoPlay();
            }

            //鼠标悬停缩略图区域时停止播放，可以考虑封装成stop方法
            pc.addEvent(this.control,'mouseover',function(){
                self.stop();
            });

            //鼠标离开悬停缩略图区域重启自动播放
            pc.addEvent(this.control,'mouseout',function(){
                self.startAutoPlay();
            });

            //鼠标悬停右切换时停止自动播放
            pc.addEvent(this.nextBtn,'mouseover',function(){
                self.stop();
            });

            //鼠标离开右切换时重启自动播放
            pc.addEvent(this.nextBtn,'mouseout',function(){
                self.startAutoPlay();
            });

            //鼠标悬停左切换时停止自动播放
            pc.addEvent(this.prevBtn,'mouseover',function(){
                self.stop();
            });

            //鼠标离开左切换时重启自动播放
            pc.addEvent(this.prevBtn,'mouseout',function(){
                self.startAutoPlay();
            })

        },

        //右切换
        //当滚动到无缝接合处时
        thumbScrollR: function(){
            var self = this,
                scrollIndex = this.scrollPos / this.thumbScrollWidth;

            this.scrollPos = this.thumbScrollWidth * (scrollIndex-1);

            if(-scrollIndex < this.realControlLenIndex){
                pc.end(this.control);
                pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing');
            }else{
                pc.end(this.control);
                pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing',function(){ pc.setStyle(self.control,'left','0px');});
                this.curPicIndex = this.thumbPos/this.thumbScrollWidth;
                this.setThumbPrevIndex(this.thumbPos/this.thumbScrollWidth -1 );
                this.scrollPos = 0;
            }
        },

        thumbScrollL: function(){
            var self = this,
                scrollIndex = this.scrollPos / this.thumbScrollWidth;

            this.scrollPos = this.thumbScrollWidth * (scrollIndex+1);

            if(-scrollIndex > 1){
                pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing');
                self.setThumbPrevIndex(self.thumbPrevIndex-1);
            }else{
                if(scrollIndex == 0){
                    //当高亮缩略图在第1张时，点击左切换，先设置无缝滚动的位置，再进行计算切换
                    var scrollPos = -self.thumbScrollWidth * self.controlLen;
                    pc.setStyle(self.control,'left',scrollPos + 'px');

                    scrollIndex = scrollPos / this.thumbScrollWidth;
                    this.scrollPos = this.thumbScrollWidth * (scrollIndex+1);

                    pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing');
                    this.setThumbPrevIndex(this.controlLen-1+this.thumbPos/this.thumbScrollWidth);
                }else{
                    pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing',function(){
                        pc.setStyle(self.control,'left',-self.thumbScrollWidth * self.controlLen + 'px');
                    });
                    this.setThumbPrevIndex(this.controlLen+this.thumbPos/this.thumbScrollWidth);
                }
            }
        },

        next: function(){
            
            this.setPic(this.curPicIndex + 1);  //切换大图

            this.thumbScrollR();  //缩略图滚动

            this.setThumbPrevIndex(this.thumbPrevIndex+1);  //保存当前缩略图索引

        },

        prev: function(){

            //当前图片在第1张时，进行左切换，需重置
            if(this.curPicIndex == 0){
                this.curPicIndex = 6;
            }

            this.setPic(this.curPicIndex - 1);  //切换大图
            
            this.thumbScrollL();   //缩略图滚动
        },

        //设置大图函数
        setPic: function(index){
            
            var self = this;
            //当无缝时，修正curPicIndex
            this.curPicIndex = index >= this.controlLen ? (index - this.controlLen) : index; 

                  
            if( this.lazy ){
                var textarea = pc.getElem('textarea',this.targets[this.curPicIndex]);
                if( textarea ){
                    this.targets[this.curPicIndex].innerHTML = textarea.value;
                }
            }
            
            // zIndex管理
            pc.setStyle(this.targets[this.prevPicIndex], 'zIndex', pc.getData(self.targets[this.prevPicIndex], 'index'));
            pc.setStyle(self.targets[self.curPicIndex], 'zIndex', self.targets.length);
            
            pc.show(self.targets[self.curPicIndex],500,function(){
                pc.setStyle(self.targets[self.curPicIndex],'filter','');
                pc.each(self.targets,function(elem){
                    if(elem != self.targets[self.curPicIndex]){
                        pc.setStyle(elem,'opacity', 0);
                    }
                })
            });

            // 停止之前的所有anim
            pc.hide(this.targets[this.prevPicIndex], 300);            
            pc.each(self.targets, function(elem){
                 if(elem != self.targets[self.curPicIndex]) pc.end(elem);
            }); 

            this.prevPicIndex = this.curPicIndex;
        },

        //设置shade
        setShadePos: function(index){

            this.thumbPos = this.thumbPos + this.thumbScrollWidth * ( index - this.thumbPrevIndex );

            pc.end(this.shade);

            pc.animate(this.shade,{'left':this.thumbPos + 'px'},300,'swing');

        },

        //用于切换高亮缩略图
        setThumbPrevIndex: function(index){
            this.thumbPrevIndex = index;
        },

        startAutoPlay: function(){
            var self = this;
            this.autoPlayTimer = setInterval(function(){
                self.next();
            },self.stay);
        },

        stop: function(){
            this.autoPlayTimer && clearInterval(this.autoPlayTimer);
        }
    };

    window.SliderPCgames = SliderPCgames;
})();