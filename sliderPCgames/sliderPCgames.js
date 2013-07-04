/*
 * @components SliderPCgames ��Ϸ������ҳ����ͼ(��17173.com)
 * @author �Ź���
 * @desc ����ͼƬ�л�,������PJ�⣬������ʹ�÷�ΧС���ʲ�׼����װ�ɲ��
 * @���÷�ʽ   
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
 *      targets��{NodeLists}������ͼ���л�ͼƬ
 *
 *      control:{NodeLists} ��������ͼ
 *
 *      nextBtn: {Element} ���л�

 *      prevBtn: {Element} ���л�
 *
 *      shade: {Element} (��ѡ) �����ĵ�ǰ����ͼ��
 *              
 *      thumbScrollWidth: {Number} ����ͼ�������
 *              
 *      stay: {Number} (��ѡ)  �Զ��л�ʱ������Ĭ��Ϊ2s
 *
 *      lazy: { Boolean } (��ѡ) �������
 *
 * @version v1.0
 *
 * ��ϸʹ�ÿɲο���Ϸ������ҳ�󽹵�ͼ http://www.pcgames.com.cn/
 * ����ʱ���ϵ����������ͼƬ������أ��������ʱ�Ļص��ȹ���δ��ӣ��������������
 *
 * 2013.2.18 ����ͼƬ������ع���
 */
;(function(){
    function SliderPCgames(config){
        this.init(config);
    }
    SliderPCgames.prototype = {
        init: function(config){
            var self = this;
            this.targets = config.targets;  //�л���Ŀ��
            this.controls = config.controls;  //���ư�ť
            this.control = this.controls[0].parentNode;  
            this.nextBtn = config.nextBtn;   //��һ���л���ť
            this.prevBtn = config.prevBtn;   //��һ���л���ť
            this.stay = config.stay || 2000; //�Զ�����ʱ�䣬Ĭ��2��
            this.shade = config.shade;       //���ֲ�
            this.thumbScrollWidth = config.thumbScrollWidth;  //����ͼ�����Ŀ��
            //this.thumbShowNum = config.thumbShowNum - 1;      //��ʾ���������ͼ������Ϊ�����������ֱ�Ӽ�1��ȡindex
            this.autoPlay = config.autoPlay || true;          //Ĭ���Զ�����
            this.autoPlayTimer = null;                        //�Զ����ŵĿ��ƾ��
            this.clickTimer = null;                               //�����л��Ŀ��ƾ��
            this.lazy = config.lazy || false;
            this.prevPicIndex = this.curPicIndex = this.thumbPrevIndex = this.thumbPos = this.scrollPos = 0;
            
            //����ͼ�޷����
            this.control.innerHTML += this.control.innerHTML; //��û�������ÿ�������ɶ�һ�������ݣ����ֶ�����
            this.controlLen = this.controls.length;           //����ʵ������ͼ����
            this.realControlLenIndex = this.controlLen -1;    //������Ҫֱ��-1
            this.controls = pc.getElems('li',this.control);   //���»�ȡ���ƺ������ͼ���д��Ż�


            // ��Ҫ�����͸�����л�
            pc.setStyle(self.targets[0].parentNode, 'position', 'relative'); 
            pc.each(self.targets, function(elem, i){
                pc.setData(elem, 'index', i);
                pc.setStyle(elem,{opacity: 0, position: 'absolute', zIndex: i});
            });
            pc.setStyle(self.targets[0],{opacity: 1,zIndex: self.controlLen});

            //���л�
            pc.addEvent(this.nextBtn,'click',function(){
                clearTimeout(self.clickTimer);
                self.clickTimer = setTimeout(function(){
                    self.next();
                }, 200);
            });

            //���л�
            pc.addEvent(this.prevBtn,'click',function(){
                clearTimeout(self.clickTimer);
                self.clickTimer = setTimeout(function(){
                    self.prev();
                }, 200);
                
            })

            //Ϊ����ͼ�󶨵����л��¼�
            pc.each(self.controls,function(elem,i){
                pc.addEvent(elem,'click',function(e){

                    self.setPic(i);  //�л�ͼƬ

                    self.setShadePos(i);  //�л���ǰ����ͼ,����������

                    self.setThumbPrevIndex(i);

                    e.preventDefault();    //��ֹĬ�϶���
                });
            });

            //�Զ��л�
            if(this.autoPlay){
                this.startAutoPlay();
            }

            //�����ͣ����ͼ����ʱֹͣ���ţ����Կ��Ƿ�װ��stop����
            pc.addEvent(this.control,'mouseover',function(){
                self.stop();
            });

            //����뿪��ͣ����ͼ���������Զ�����
            pc.addEvent(this.control,'mouseout',function(){
                self.startAutoPlay();
            });

            //�����ͣ���л�ʱֹͣ�Զ�����
            pc.addEvent(this.nextBtn,'mouseover',function(){
                self.stop();
            });

            //����뿪���л�ʱ�����Զ�����
            pc.addEvent(this.nextBtn,'mouseout',function(){
                self.startAutoPlay();
            });

            //�����ͣ���л�ʱֹͣ�Զ�����
            pc.addEvent(this.prevBtn,'mouseover',function(){
                self.stop();
            });

            //����뿪���л�ʱ�����Զ�����
            pc.addEvent(this.prevBtn,'mouseout',function(){
                self.startAutoPlay();
            })

        },

        //���л�
        //���������޷�Ӻϴ�ʱ
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
                    //����������ͼ�ڵ�1��ʱ��������л����������޷������λ�ã��ٽ��м����л�
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
            
            this.setPic(this.curPicIndex + 1);  //�л���ͼ

            this.thumbScrollR();  //����ͼ����

            this.setThumbPrevIndex(this.thumbPrevIndex+1);  //���浱ǰ����ͼ����

        },

        prev: function(){

            //��ǰͼƬ�ڵ�1��ʱ���������л���������
            if(this.curPicIndex == 0){
                this.curPicIndex = 6;
            }

            this.setPic(this.curPicIndex - 1);  //�л���ͼ
            
            this.thumbScrollL();   //����ͼ����
        },

        //���ô�ͼ����
        setPic: function(index){
            
            var self = this;
            //���޷�ʱ������curPicIndex
            this.curPicIndex = index >= this.controlLen ? (index - this.controlLen) : index; 

                  
            if( this.lazy ){
                var textarea = pc.getElem('textarea',this.targets[this.curPicIndex]);
                if( textarea ){
                    this.targets[this.curPicIndex].innerHTML = textarea.value;
                }
            }
            
            // zIndex����
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

            // ֹ֮ͣǰ������anim
            pc.hide(this.targets[this.prevPicIndex], 300);            
            pc.each(self.targets, function(elem){
                 if(elem != self.targets[self.curPicIndex]) pc.end(elem);
            }); 

            this.prevPicIndex = this.curPicIndex;
        },

        //����shade
        setShadePos: function(index){

            this.thumbPos = this.thumbPos + this.thumbScrollWidth * ( index - this.thumbPrevIndex );

            pc.end(this.shade);

            pc.animate(this.shade,{'left':this.thumbPos + 'px'},300,'swing');

        },

        //�����л���������ͼ
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