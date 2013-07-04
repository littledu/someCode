/*
 * @components Marquee 无缝滚动
 * @author littledu  http://www.cnblogs/littledu   http://www.littledu.in
 * @desc 用于图片，文字等左右上下不间断滚动；
         支持左右按钮单击改变方向，长按加速等功能；
 * @property
 * 		id：{String}：无缝滚动的入口标识
 *
 * 	    direction: {String} (可选) ["left","right","up","down"]: 方向参数。默认为'left';
 * 		        eg: new Marquee({marqueeId:'idString',direction:'left'});
 * 		step: {Number} (可选) 移动的步长，值越大，则滚动速度越快。默认为1；
 *              eg: new Marquee({marqueeId:'idString',direction:'left',step:2});
 * 		speed: {Number} (可选) 移动的速度，值越小，则滚动速度越快。默认为30；
 *              eg: new Marquee({marqueeId:'idString',direction:'left',step:2,speed:100});
 * 		control: {Number} (可选) 左右按钮控制。默认没有左右方向按钮,添加参数值不为0或false的值则启用控制按钮功能；注：需自己添加按钮结构代码，详见事例；
 *              eg: new Marquee({marqueeId:'idString',direction:'left',step:2,speed:100,control:true});
 * 
 * @version v1.0
 *
 */

function Marquee(options){
	this.init(options);
};

Marquee.prototype = {
    init:function(options){
        var self = this;
        self.setOptions(options);
        var c = self.config;
        self.id = c.id;
	    self.marquee = document.getElementById(self.id);
	    self.container = self.marquee.getElementsByTagName('div')[0];   //获取实际滚动层，有待商榷，考虑改进方式：直接传id，避免使用者在其前套多一层div，理论上不常见。
	
	    //初始化
	    self.direction = c.direction;
        self.step = c.step;
        self.speed = c.speed;
	    self.marqueeWidth = this.container.offsetWidth;
	    self.marqueeHeight = this.container.offsetHeight;

	    self.create(self.id);

        if(self.direction == 'left' || self.direction == 'right'){
	        //实现当实际内容长度少于滚动长度时，不滚动，等于或大于自动滚动
    	    if(self.scrollContent.offsetWidth < self.container.offsetWidth){
		        self.needScroll = false;
		        return;
	        }else{
		        self.scrollContent.style.width = self.scrollContent.offsetWidth * 2 + 'px';  //实现横向滚动的关键代码，让内容层足够宽容纳副本
		        self.scrollContent.innerHTML += self.scrollContent.innerHTML;
	        }
        }else{
            self.scrollContent.innerHTML += self.scrollContent.innerHTML;    
        }

	    //按钮控制部分
	    if(c.control) self.changeDirection(self.id);

	    //鼠标悬停时停止滚动
	    self.container.onmouseover = function(){ self.stop(); };

	    //鼠标移开时继续滚动
	    self.container.onmouseout = function(){ self.start(); };

        self.start();
    },
    extend:function(config,source){
        for(var proterty in source){
            config[proterty] = source[proterty];
        }
    },
    setOptions:function(options){
        var self = this;
        self.config = {
            timer:null,
            needScroll:true,
            step:1,
            speed:30,
            direction:'left'
        };
        self.extend(self.config,options);
    },
	create:function(){          //建立内容包裹层，不对使用者公开是想让结构更简单，更方便使用。
		var self = this;
        var temp = self.container.innerHTML;
		var tempDiv = document.createElement('div');
		self.container.innerHTML = '';
		tempDiv.innerHTML = temp;
		self.scrollContent = self.container.appendChild(tempDiv);
		self.scrollContent.className = self.id + '-content';
	},
	start:function(){
        var c = this.config;
		if(!c.needScroll) return;
		var self = this;
		c.timer = setInterval(function(){self.scrolling(self.direction);},self.speed);
	},
	stop:function(){
		var self = this;
        var c = self.config;
		clearInterval(c.timer);
	},
	scrolling:function(direction){
        var self = this;
		switch(direction){
			case 'left':
				if(self.container.scrollLeft >= self.marqueeWidth) self.container.scrollLeft = 0;
				self.container.scrollLeft += self.step;
				break;
			case 'right':
				if(self.container.scrollLeft <= 0) self.container.scrollLeft = self.marqueeWidth;
				self.container.scrollLeft -= self.step;
				break;
			case 'up':
				if(self.container.scrollTop == self.marqueeHeight) self.container.scrollTop = 0;
				self.container.scrollTop += self.step;
				break;
			case 'down':
				if(self.container.scrollTop == 0) self.container.scrollTop = self.marqueeHeight;
				self.container.scrollTop -= self.step;
				break;
		}  
	},
    changeDirection:function(){
        var self = this;
        self.prev = document.getElementById(self.id+'-prev');    //统一的按钮命名，根据入口id设置。即假设使用者的入口ID为marquee,则左右的按钮id分别为marquee-prev和marquee-next
		self.next = document.getElementById(self.id+'-next');
		if(!self.prev || !self.next){ self.start(); return;}

        //单击时改变方向
		self.prev.onclick = function(){self.changeToggle('left',1);}

		self.next.onclick = function(){self.changeToggle('right',1);}
	
        //长按时加速
		self.prev.onmousedown = function(){self.changeToggle('left',10);}

        //重置
		self.prev.onmouseup = function(){self.changeToggle('left',1);}

		self.next.onmousedown = function(){self.changeToggle('right',10);}

		self.next.onmouseup = function(){self.changeToggle('right',1);}
    },
    //方向按钮辅助
    changeToggle:function(direction,step){
        var self = this;
        self.stop();
        self.direction = direction;
        self.step = step;
        self.start();
    }
}
