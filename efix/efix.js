/*
 * @components efix Ԫ�ع̶����
 * @author littledu 410491325@qq.com   
 * @desc ����ҳ����Ԫ�ز�����������Ĺ���������
 * @property
 * 		id��{String}����Ҫ�̶���Ԫ��id
 *
 *      isScroll: {Boolean} �ǹ���������ʱfixed������ֱ������fixed,Ĭ��Ϊfalse
 *
 *      top : {Number} ��isScrollΪfalseʱ������fixedԪ�ص�topλ��
 *
 *      left : {Number} ��isScrollΪfalseʱ������fixedԪ�ص�leftλ��
 *
 *      marginTop : {Number} ��isScrollΪtrueʱ������fixedԪ�ؾ��붥���ľ���
 *
 *      onresize : {Function} ��isScrollΪfalseʱ����Ҫ����һЩ���������翿�ұߵĶ�����棬���½ǵĵ����㣬������resize
 * @version v1.0
 *
 * ����offsetParent:�����Ա�׼�ǻ᷵����Ԫ������Ķ�λ����Ԫ�أ���IE678�£����Ƿ�����Ԫ��������������ܼ���hasLayout������Ԫ�أ���Ӱ��Ԫ�ص�offsetLeft/offsetTop����Ӱ��top��left��
 *
 * IE67�£�domԪ�صĸı�ᴥ��window.onresize�¼�������������ǶԱ�resizeǰ��Ŀ��Ӵ��ڴ�С����ʶ��������window.onresize
 */


function efix(options){ this.init(options);}

efix.prototype = {
    init : function(options){
               var self = this;
               this.config = options;
               this.fixTimer = false;  //һ��ȫ�ֹ��ӣ��ö�̬���ʽ��ִֻ��һ��

               //IE67�£�domԪ�صĸı�ᴥ��window.onresize�¼�������������ǶԱ�resizeǰ��Ŀ��Ӵ��ڴ�С����ʶ��������window.onresize�������ﱣ��resizeǰ�Ŀ��Ӵ��ڴ�С
               this.saveWidth = document.documentElement.clientWidth;
               this.saveHeight = document.documentElement.clientHeight;
               
               this.id = this.config.id;
               this.target = document.getElementById(this.id);
               
               this.marginTop = this.config.marginTop || 0;                //�붥���ľ���
               this.top = this.config.top || 0;
               this.left = this.config.left || 0;
               this.curTop = this.target.getBoundingClientRect().top - this.marginTop;       //��ȡԪ��fixedǰ��topλ��  ���ã���Ϊfixed��ʼʱ�ж�
               this.curWidth = parseInt(this.target.currentStyle ? this.target.currentStyle['width'] : getComputedStyle(this.target,null)['width']);//Ԫ��fixed���ʧȥ��ȸ߶ȣ�����fixedǰ�Ŀ��
               this.isIE6 = !-[1,] && !window.XMLHttpRequest;         //�ж�IE6
               this.saveStyle = this.target.style.cssText || '';      //���Ԫ��ԭ������Ƕ��style�����棬�ں�������marginʱ��ԭ����style����Ԫ��

               //���IE6���������⣬ֻ���һ��
               if(this.isIE6 && document.body.currentStyle.backgroundAttachment !== 'fixed'){
                   var ebody = document.body;
                   ebody.style.backgroundImage = 'url(about:blank)';
                   ebody.style.backgroundAttachment = 'fixed';
               }

               this.setPosition();


               //��Ԫ�ر����ж�λʱ��isScrollΪtrue��Ԫ�ز���Ҫresize
               var isPosition = this.target.currentStyle ? this.target.currentStyle['position'] : getComputedStyle(this.target,null)['position'];
               if(isPosition == 'static'){
                   this.addEvent(window,'resize',function(){ self.fixResize(); });
               }

               if(this.config.isScroll){
                    //����fixedԪ�صĸ������Ա�֤Ԫ��fixed���ĵ��ṹ����
                    this.createCopyElement();
                    this.addEvent(window,'scroll',function(){ self.fixScroll(); });
               }else{
                    document.body.appendChild(this.target);
                    this.fixStatic();
               }
           },

    /*
     * ����fixedԪ�ص�λ��
     *
     * 1.IE67�£�domԪ�صĸı�ᴥ��window.onresize�¼������ȶԱ���ǰ��Ĵ��ڴ�Сֵ����ʶ��������window.onresize�¼�
     * 2.�ڽ���fixedʱ���ı䴰�ڴ�С�������»�ȡfixedԪ�ص�λ�ã���fixedʱ��λ���ǲ���ģ����Ƚ�Ԫ����Ϊstatic���ٻ�ȡ��ȷ��λ��ֵ
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
     * ����fixedԪ����ȷ��λ��ֵ
     * */
    setPosition : function(){
                      this.positionParent = this.target.offsetParent;        //������ж�λ��haslayout������Ԫ�أ�����Ѱ�Ҳ�������ȷ�Ķ�λ����Ԫ��
                      if(this.isIE6 && this.searchPosition()){
                           //IE6�£�����丸Ԫ���ж�λʱ����ȡԪ��fixed���leftֵ����Ҫ�����Ķ�λ��Ԫ�ص�topֵ
                           this.curLeft = this.target.getBoundingClientRect().left - this.positionParent.getBoundingClientRect().left;
                           window[this.id+'nTop'] = this.positionParent.getBoundingClientRect().top - 2 - this.marginTop
                       }else{
                           this.curLeft = this.target.getBoundingClientRect().left - 2;
                           window[this.id+'nTop'] = -this.marginTop;
                      }
                  },

    /*
     * Ѱ������Ԫ���Ƿ��ж�λ
     *
     * offsetParent��ָ���ж�λ�ģ�������haslayout���Ե�Ԫ�أ���ͨ��offsetParent���ϲ���
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
     * �̶���λ�ķ���(isScorllΪfalse)
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
     * �̶���λ�ķ���(isScrollΪtrue)
     *
     * ���������߶ȵ���Ԫ��λ��ʱ����ʼfixed��ԭ����ͨ��cssTextһ�������ã���ʵ�������������cssTextʱ����setExpression���г�ͻ������ʧЧ����ֻ��һ����style����
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
     * ���ù̶���λֵ(isScrollΪtrue�����)
     *
     * ���ڲ����϶�������ʱ��һֱ�ظ�ִ������ֵ���ʷ����һ��������������fixTimer�����ж��Ƿ�ִ�й�
     * */
    setScrollFix : function(){
                if(this.isIE6){
                    this.target.style.position = 'absolute';
                    this.target.style.left = this.curLeft + 'px';
                    this.target.style.setExpression('top','eval(document.documentElement.scrollTop) - window[this.id+"nTop"] +"px"');
                    this.copyElement.style.display = 'block';       //��ʾ�����������Ӿ�������
                    this.copyElement.style.visibility = 'hidden';
                    this.setCommonStyle();
                    this.fixTimer = true;
                }else{
                    this.target.style.position = 'fixed';
                    this.target.style.left = this.curLeft + 2 + 'px';
                    this.target.style.top = this.marginTop + 'px';
                    this.copyElement.style.display = 'block';       //��ʾ�����������Ӿ�������
                    this.copyElement.style.visibility = 'hidden';
                    this.setCommonStyle();
                    this.fixTimer = true;
                }
             },

    /*
     * ���ù�����ʽ
     *
     * ���ڶ���õ�������һ����
     * */
    setCommonStyle : function(){
                      this.target.style.width = this.curWidth + 'px';
                      this.target.style.zIndex = 9999;                //��fixedԪ������ǰ
                      this.target.style.margin = 0;                   //��ֹmarginӰ�춨λ
                  },
    /*
     * ����fixedʵ��
     *
     * fixed�������ĵ����󣬺����Ԫ�ػᶥ������λ�ã�Ϊ�������������ʽ�fixed����һ�ݣ������أ�����ʼfixedʱ���л���ʾ
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
     * ���¼�����
     * */
    addEvent : function (ele, type, fnHandler) {
        return ele.addEventListener ? ele.addEventListener(type, fnHandler, false) : ele.attachEvent('on' + type, fnHandler);
    }
}


