/**
 * cmsר���ٲ���
 * @method waterfall.init();
 * @static
 * @param { String || node } id �ٲ�����ڣ����Դ���id�ַ�����Ҳ�����ǽڵ�
 * @param { Number } boxWidth Ԫ�ؿ��С
 * @param { Number } boxNum  һ�����ɶ��ٸ�Ԫ�ؿ�
 * @param { Number } margin Ԫ�ؿ���
 * @param { String } request ��������url
 * @param { Function } callback �ص�����������ƴ������
 * @example
 * �ӿ���ʽ��var src = 'http://www.pcbaby.com.cn/pckidstest/x/json/1209/1134158_';
 * waterfall.init({id: 'water',boxWidth:250,boxNum:4,margin:0,request:src,callback:cb});
 * 
 */
(function(){
    var waterfall = {
        /**
         * ��ʼ���������������ݴ���������ʱ�����ǲ����Ƿ��д�ֵ
         */
        init: function(config){
            var _this = this;
            this.wrap = document.getElementById(config.id) || config.id;
            this.boxWidth = config.boxWidth;
            this.boxNum = config.boxNum;
            this.margin = config.margin;
            this.boxW = this.boxWidth + this.margin; 
            this.page = 1; 
            this.url = config.request;
            this.request = this.url + this.page + '.html';  //ƴ������url
            this.data = '';
            this.called = false; //���ڱ�ʶ��ǰ�����Ƿ����󣬱����ظ�����
            this.indexImage = 0;
            this.h = [];
            this.loaded = document.getElementById('Jloading'); //�ֲڵ�ʵ�֣����ֶ�����һ��JloadingԪ�أ����ڱ�ʶ�϶����ײ�������Ҫ���Ƕ�̬����


            this.getScript(this.request); //��������������ڽӿ���jsonp��ʽ������һ���������Զ����ûص���������ƴװ����


            this.addEvent(window,'scroll',function(){
                var a=document.body.scrollHeight;
                var b=document.documentElement.clientHeight;
                var c=document.documentElement.scrollTop + document.body.scrollTop;
                
                var h = _this.getSubClient(_this.loaded);
                if((b+c > h) && _this.called){
                    _this.page = _this.page + 1;
                    _this.request = _this.url + _this.page + '.html';
                    if(_this.page == _this.pageNum){
                        _this.end();
                        return;
                    }
                    _this.getScript(_this.request);
                    _this.called = false;
                }
            });
        },
        /**
         * ��������
         * @param  {[type]} html [description]
         * @return {[type]}      [description]
         */
        createData: function(html){
            var fragment = document.createElement('ul');
            fragment.innerHTML = html;
            var childNodes = fragment.childNodes;
            this.wrap.appendChild(fragment);

            //this.imgReady(fragment.getElementsByTagName('img'),fragment);   
            var imgs = fragment.getElementsByTagName('img'),
                len = imgs.length;
            for(var i = 0; i < len; i++){
                this.imgReady(imgs[i].src,fragment,i,len);
            }      

        },
        imgReady: function(url,ele,index,len){
            var img = new Image();
          
              var width = img.width;

              img.src = url;

              var _this = this;
              //��˵�����Ԥ����
              var interval = setInterval(function(){
                var newWidth = img.width;
                if(width != newWidth){
                  clearInterval(interval);
                  if(index == len-1){
                    _this.sort(ele.getElementsByTagName('li'));
                  }
                  return;
                }
              },40);
        },
        
        /*imgReady: function(imgs,ele){
            var j = 0;
            for(var i = 0; i < imgs.length; i++){
                var img = new Image();
                img.src = imgs[i].src;
                var _this = this;
                if(img.complete){
                    j = j + 1;
                    if(j == imgs.length){
                        _this.sort(ele.getElementsByTagName('li'));
                    }
                }else{
                    img.onload = function(){
                        j = j + 1;
                        if(j == imgs.length){
                            _this.sort(ele.getElementsByTagName('li'));
                        }
                        //img.onload = null;
                    }
                }
            }
        },*/
        sort: function(eles){
            var minH = maxH = boxh = minKey = maxKey = 0;

            for(var i = 0; i < eles.length; i++){
                boxh = eles[i].offsetHeight;

                if(this.h.length < this.boxNum){
                    this.h[i] = boxh;
                    eles[i].style.top = 0 + 'px';
                    eles[i].style.left = (i * this.boxW) + 'px';
                }else{
                    minH = this.min(this.h);
                    minKey = this.getArrayKey(this.h,minH);
                    this.h[minKey] += (boxh + this.margin);
                    eles[i].style.top = minH + this.margin + 'px';
                    eles[i].style.left = (minKey * this.boxW) + 'px';
                }

                maxH = this.max(this.h);
                maxKey = this.getArrayKey(this.h,maxH);
                this.wrap.style.width = this.boxNum * this.boxWidth + 'px';
                this.wrap.style.height = this.h[maxKey] + 'px';
                this.wrap.style.visibility = 'visible';
            }

            for(var i = 0; i < eles.length; i++){
                eles[i].style.visibility = 'visible';
            }

            this.called = true;
        },
        min: function(arr){
            return Math.min.apply(Math,arr);
        },
        max: function(arr){
            return Math.max.apply(Math,arr);
        },
        getArrayKey: function(s,v){
            for(k in s){
                if(s[k] == v){
                    return k;
                }
            }
        },
        getScript: function(url, callback){
            callback = callback || function(){};
            var scr = document.createElement('script');
            var _this = this;
            scr.onload = scr.onreadystatechange = function(){
                var st = scr.readyState;
                if(st && st!=='loaded' && st!=='complete') return;
                scr.onload = scr.onreadystatechange = null;
                callback();
            };
            scr.src = url;
            document.getElementsByTagName('head')[0].appendChild(scr);
        },
        getSubClient: function(node){
            var posT = node.offsetTop;
            while(node = node.offsetParent){
                posT += node.offsetTop;
            }
            return posT;
        },
        end: function(){
            this.loaded.innerHTML = '��ʱû�������ˡ�';
        },
        addEvent: function(ele,type,fnHandler){
            return ele.addEventListener ? 
                ele.addEventListener(type,fnHandler,false) : 
                ele.attachEvent('on' + type,fnHandler);
        }
    }
    window.waterfall = waterfall;
})();