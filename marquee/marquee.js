/*
 * @components Marquee �޷����
 * @author littledu  http://www.cnblogs/littledu   http://www.littledu.in
 * @desc ����ͼƬ�����ֵ��������²���Ϲ�����
         ֧�����Ұ�ť�����ı䷽�򣬳������ٵȹ��ܣ�
 * @property
 * 		id��{String}���޷��������ڱ�ʶ
 *
 * 	    direction: {String} (��ѡ) ["left","right","up","down"]: ���������Ĭ��Ϊ'left';
 * 		        eg: new Marquee({marqueeId:'idString',direction:'left'});
 * 		step: {Number} (��ѡ) �ƶ��Ĳ�����ֵԽ��������ٶ�Խ�졣Ĭ��Ϊ1��
 *              eg: new Marquee({marqueeId:'idString',direction:'left',step:2});
 * 		speed: {Number} (��ѡ) �ƶ����ٶȣ�ֵԽС��������ٶ�Խ�졣Ĭ��Ϊ30��
 *              eg: new Marquee({marqueeId:'idString',direction:'left',step:2,speed:100});
 * 		control: {Number} (��ѡ) ���Ұ�ť���ơ�Ĭ��û�����ҷ���ť,��Ӳ���ֵ��Ϊ0��false��ֵ�����ÿ��ư�ť���ܣ�ע�����Լ���Ӱ�ť�ṹ���룬���������
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
	    self.container = self.marquee.getElementsByTagName('div')[0];   //��ȡʵ�ʹ����㣬�д���ȶ�����ǸĽ���ʽ��ֱ�Ӵ�id������ʹ��������ǰ�׶�һ��div�������ϲ�������
	
	    //��ʼ��
	    self.direction = c.direction;
        self.step = c.step;
        self.speed = c.speed;
	    self.marqueeWidth = this.container.offsetWidth;
	    self.marqueeHeight = this.container.offsetHeight;

	    self.create(self.id);

        if(self.direction == 'left' || self.direction == 'right'){
	        //ʵ�ֵ�ʵ�����ݳ������ڹ�������ʱ�������������ڻ�����Զ�����
    	    if(self.scrollContent.offsetWidth < self.container.offsetWidth){
		        self.needScroll = false;
		        return;
	        }else{
		        self.scrollContent.style.width = self.scrollContent.offsetWidth * 2 + 'px';  //ʵ�ֺ�������Ĺؼ����룬�����ݲ��㹻�����ɸ���
		        self.scrollContent.innerHTML += self.scrollContent.innerHTML;
	        }
        }else{
            self.scrollContent.innerHTML += self.scrollContent.innerHTML;    
        }

	    //��ť���Ʋ���
	    if(c.control) self.changeDirection(self.id);

	    //�����ͣʱֹͣ����
	    self.container.onmouseover = function(){ self.stop(); };

	    //����ƿ�ʱ��������
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
	create:function(){          //�������ݰ����㣬����ʹ���߹��������ýṹ���򵥣�������ʹ�á�
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
        self.prev = document.getElementById(self.id+'-prev');    //ͳһ�İ�ť�������������id���á�������ʹ���ߵ����IDΪmarquee,�����ҵİ�ťid�ֱ�Ϊmarquee-prev��marquee-next
		self.next = document.getElementById(self.id+'-next');
		if(!self.prev || !self.next){ self.start(); return;}

        //����ʱ�ı䷽��
		self.prev.onclick = function(){self.changeToggle('left',1);}

		self.next.onclick = function(){self.changeToggle('right',1);}
	
        //����ʱ����
		self.prev.onmousedown = function(){self.changeToggle('left',10);}

        //����
		self.prev.onmouseup = function(){self.changeToggle('left',1);}

		self.next.onmousedown = function(){self.changeToggle('right',10);}

		self.next.onmouseup = function(){self.changeToggle('right',1);}
    },
    //����ť����
    changeToggle:function(direction,step){
        var self = this;
        self.stop();
        self.direction = direction;
        self.step = step;
        self.start();
    }
}
