;(function(){
    function Slider17173(config){
        this.init(config);
    }
    Slider17173.prototype = {
        init: function(config){
            var self = this;
            this.targets = config.targets;  //切换的目标
            this.controls = config.controls;  //控制按钮
            this.control = this.controls[0].parentNode;  
            this.nextBtn = config.nextBtn;   //下一张切换按钮
            this.prevBtn = config.prevBtn;   //上一张切换按钮
            this.shade = config.shade;       //遮罩层
            this.thumbScrollWidth = config.thumbScrollWidth;  //缩略图滚动的宽度
            this.thumbShowNum = config.thumbShowNum - 1;      //显示区域的缩略图张数，为方便控制这里直接减1获取index
            this.autoPlay = config.autoPlay || true;          //默认自动播放
            this.autoPlayTimer = null;                        //自动播放的控制句柄
            this.timerR = null;                               //右切换的控制句柄
            this.timerL = null;                               //左切换的控制句柄
            this.curPicIndex = this.thumbPrevIndex = this.thumbPos = this.scrollPos = 0;
            this.reset = false;
            
            //缩略图无缝滚动
            this.control.innerHTML += this.control.innerHTML; //暂没考虑设置宽度以容纳多一倍的内容
            this.controlLen = this.controls.length;           //保存实际缩略图个数
            this.controls = pc.getElems('li',this.control);   //重新获取复制后的缩略图，有待优化

            //右切换
            pc.addEvent(this.nextBtn,'click',function(){
                clearTimeout(self.timerR);
                self.timerR = setTimeout(function(){
                    self.next();
                }, 200);
            });

            //左切换
            pc.addEvent(this.prevBtn,'click',function(){
                clearTimeout(self.timerL);
                self.timerL = setTimeout(function(){
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

            if(this.autoPlay){
                self.autoPlayTimer && clearInterval(self.autoPlayTimer);
                this.autoPlayTimer = setInterval(function(){
                    self.next();
                },2000);
            }

            pc.addEvent(this.control,'mouseover',function(){
                self.autoPlayTimer && clearInterval(self.autoPlayTimer);
            });

            pc.addEvent(this.control,'mouseout',function(){
                self.autoPlayTimer = setInterval(function(){
                    self.next();
                },2000);
            });

            pc.addEvent(this.nextBtn,'mouseover',function(){
                self.autoPlayTimer && clearInterval(self.autoPlayTimer);
            });

            pc.addEvent(this.nextBtn,'mouseout',function(){
                self.autoPlayTimer = setInterval(function(){
                    self.next();
                },2000);
            });

            pc.addEvent(this.prevBtn,'mouseover',function(){
                self.autoPlayTimer && clearInterval(self.autoPlayTimer);
            });

            pc.addEvent(this.prevBtn,'mouseout',function(){
                self.autoPlayTimer = setInterval(function(){
                    self.next();
                },2000);
            })

        },

        //右切换
        //当滚动到无缝接合处时
        thumbScrollR: function(){
            var self = this,
                scrollIndex = this.scrollPos / this.thumbScrollWidth,
                controlLen = this.controlLen - 1; //待优化

            this.scrollPos = this.thumbScrollWidth * (scrollIndex-1)

            if(-scrollIndex < controlLen){
                pc.end(this.control);
                pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing');
            }else{
                pc.end(this.control);
                pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing',function(){ pc.setStyle(self.control,'left','0px');});
                this.curPicIndex = this.thumbShowNum;
                this.reset = true;
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
                    self.setThumbPrevIndex(this.controlLen-1);  
                }else{
                    pc.animate(this.control,{'left':this.scrollPos + 'px'},300,'swing',function(){
                        pc.setStyle(self.control,'left',-self.thumbScrollWidth * self.controlLen + 'px');
                    });
                    self.setThumbPrevIndex(this.controlLen);  
                }
            }
        },

        next: function(){
            var nextIndex = this.curPicIndex + 1,
                i = parseInt(pc.getStyle(this.shade,'left')) / this.thumbScrollWidth,
                //showNumIndex = this.thumbShowNum - 1,
                self = this;

            this.setPic(nextIndex);  //切换大图

            //当高亮缩略图到达边界时，切换无缝的缩略图
            if(i < this.thumbShowNum){
                this.setShadePos(this.thumbPrevIndex+1);
                this.setThumbPrevIndex(this.thumbPrevIndex+1);
            }else{
                this.thumbScrollR();
                this.setThumbPrevIndex(this.thumbPrevIndex+1);
            };
        },

        prev: function(){

            if(this.curPicIndex == 0){
                this.curPicIndex = 6;
            }

            var prevIndex = this.curPicIndex - 1,
                i = parseInt(pc.getStyle(this.shade,'left')) / this.thumbScrollWidth,
                //showNumIndex = this.thumbShowNum - 1,
                self = this;

            this.setPic(prevIndex);
            if(i > 0){
                this.setShadePos(this.thumbPrevIndex-1);
                self.setThumbPrevIndex(self.thumbPrevIndex-1);
            }else{
                this.thumbScrollL();
            };    
        },

        //设置大图函数
        setPic: function(index){
            pc.each(this.targets,function(elem){
                pc.hide(elem);
            });

            //当无缝时，修正curPicIndex
            this.curPicIndex = index >= this.controlLen ? (index - this.controlLen) : index;

            //后续会改为fade动画
            pc.show(this.targets[this.curPicIndex]);

        },

        //设置shade
        setShadePos: function(index){
            this.thumbPos = this.thumbPos + this.thumbScrollWidth * ( index - this.thumbPrevIndex );

            pc.end(this.shade);

            //原思路是通过判断边界以修复快速切换时的位置
            /*if(this.thumbPos <= 231){
                pc.animate(this.shade,{'left':this.thumbPos + 'px'},300,'swing');
                this.setThumbPrevIndex(this.thumbPrevIndex+1);
            }else{
                pc.animate(this.shade,{'left':'231px'},300,'swing');
            }*/

            //由于做了函数节流故可直接实现
            pc.animate(this.shade,{'left':this.thumbPos + 'px'},300,'swing');
            //this.setThumbPrevIndex(this.thumbPrevIndex+1);
            //this.setThumbPrevIndex(index);
        },

        //用于切换高亮缩略图
        setThumbPrevIndex: function(index){
            this.thumbPrevIndex = this.reset ? (this.reset = false,this.thumbShowNum) : index;
        }
    };

    window.Slider17173 = Slider17173;
})();