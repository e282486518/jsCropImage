/*****
 ** a plugin for image upload
 ** view doc https://github.com/Vanthink-UED/jquery.core.image.upload
 ******/

;(function ($) {


    var pluginName = 'coreImageUpload';

    function Plugin(element, options) {

        this.$el = $(element);
        this.options = $.extend({}, $.fn[pluginName].defaults, options);
        this.init();
    }
    
    
    // dialog for preview image and crop
    // @param files the input of type=file value
    // @param options 
    var ImageBox = function (files,options,func) {
       this.image = {
           file: files,
       }; 
       this.options = options;  
       this.uploadAction = func;
       if (files) {
            var reader = new FileReader();
            var self = this;
            reader.onload = function (e) {
                self.image.src = e.target.result;
                self.show();
            }
            
            reader.readAsDataURL(files[0]);
        }
        this.dialog = $('<div class="g-core-image-corp-container"></div>');
        this.imageAside = $('<div class="image-aside"></div>');
        this.infoAside = $('<div class="info-aside"></div>');
       // this.show();

    }

    ImageBox.prototype = {
        show: function () {
            this.dialog.append(this.imageAside, this.infoAside);
            $('body').append(this.dialog);
            //this.outputConfigInfo();
            this._initButtons();
            this._initCropBox();
            this._bind();
        },

        hide: function () {
            this.dialog.remove();
        },

        initPic: function ($container) {
            var pic = new Image();
            
            pic.src = this.image.src;
            pic.onload = (function() {
                /* 将源图片对象记录 */
                var data = {};
                data["source"] = pic;
                this.options.data = $.extend(this.options.data,data);
                
                this.image.width = pic.naturalWidth;console.log(pic);
                this.image.height =pic.naturalHeight;
                
                this.reseyLayout(pic,$container);
                this.showCropBox($container, 'create');
                
            }).bind(this);
        },  
        reseyLayout: function(image,$container) {
            var H = window.innerHeight - 80;
            var W = window.innerWidth - 60;
            var imageWidth = this.image.width;
            var imageHeight = this.image.height;
            var R = imageWidth / imageHeight;
            var Rs = W / H;
            if (R > Rs) {
                $(image).css({
                    'width': W,
                    'height': W / R
                });
                if ($container) {
                    $container.css({
                        'width': W,
                        'height': W / R,
                        'margin-top': (H - W / R) / 2
                    });
                }
            } else {
                $(image).css({
                    'width': H * R,
                    'height': H
                });
                if ($container) {
                    $container.css({
                        'width': H * R,
                        'height': H,
                        'margin-left': (W - H * R) / 2
                    });
                }
            }
            if (!$container) {
                this.imageAside.append(image);
            } else {
                $container.append(image);
            }
            this.options.imgChangeRatio = imageWidth / $(image).width();console.log($(image).width());
            // Options.changgedImgRatio=parseFloat(this.pic.width())/parseFloat(this.pic.height());
            //alert(Options.changgedImgRatio);
        },

        _bind: function () {
            var self = this;
            this.btnUpload.on('click', function (e) {
                 self.doCropEvent(e);
            });
            this.btnCancel.on('click', function () {
                self.dialog.remove();
                $('.g-core-image-upload-element').find("input[type=file]").val('');  
            });
        },

        _initButtons: function () {
            this.btnUpload = $('<button type="button" class="btn btn-upload">确定</button>');
            this.btnCancel = $('<button type="button" class="btn btn-cancel">取消</button>');
            var $btnGroup = $('<p class="btn-groups"></p>');
            $btnGroup.append(this.btnUpload, this.btnCancel);
            this.infoAside.append($btnGroup);

        },

        setNotice: function (result) {
            this.notice = $('<div class="notice-info">' + result.errmsg + '</div>')
            if (!this.infoAside.find('notice-info').length) {
                this.infoAside.prepend(this.notice);

            } else {
                this.notice.text(result.errmsg);
            }
            if (this.response.errno) {
                this.notice.show;
            }
            if (this.response.errno == 2) {
                this.infoAside.find('.notice-info').addClass('errro');
            }
        },
        _outputImageDetails: function () {
            var $table = $('<table class="image-details"></table>');
            var htmlStr = '<tr><td>图片名称</td><td>' + this.response.data.name + '</td></tr>';
            htmlStr += '<tr><td>图片宽度</td><td>' + this.response.data.width + 'px</td></tr>';
            htmlStr += '<tr><td>图片高度</td><td>' + this.response.data.height + 'px</td></tr>';
            $table.html(htmlStr);
            var $configInfo = $('<div class="config-info"></div>');
            $configInfo.append($table);
            this.infoAside.append($configInfo);
        },


        _initCropBox: function () {
            this.imageAside.append('<div class="g-crop-image-box"><div class="g-crop-image-principal"><div></div>');
            var $principal = this.imageAside.find('.g-crop-image-principal');
            this.initPic($principal);
            
        },
        // crop
        showCropBox: function ($wrap, state) {
            var $selectCrop = $('<div class="select-recorte"></div>');
            $wrap.append($selectCrop);
            var imageWidth = parseInt($wrap.css('width'));
            var imageHeight = parseInt($wrap.css('height'));
            var ratioW = this.options.cropRatio.split(':')[0],
                ratioH = this.options.cropRatio.split(':')[1];
            var Swidth = (imageWidth / 100) * 80;
            var Sheight = (Swidth / ratioW) * ratioH;
            $selectCrop.css({
                "width": Swidth,
                "height": Sheight,
                "left": (imageWidth - Swidth) / 2,
                "top": (imageHeight - Sheight) / 2
            });
            if (Sheight > imageHeight) {
                Sheight = (imageHeight / 100) * 80;
                Swidth = (Sheight * ratioW) / ratioH;
                $selectCrop.css({
                    "width": Swidth,
                    "height": Sheight,
                    "left": (imageWidth - Swidth) / 2,
                    "top": (imageHeight - Sheight) / 2
                });
            };
            if (state == "create") {

                var me = this;

                $selectCrop.resizable({
                    containment: "parent",
                    aspectRatio: this.options.cropRatio,
                    minWidth: (Swidth / 100) * 10,
                    minHeight: (Sheight / 100) * 10,
                    resize: function (e) {
                        var ui = $(e.target);
                        var x = ui.css('left');
                        var y = ui.css('top');
                        var w = ui.width();
                        var h = ui.height();

                    }
                });
                $selectCrop.draggable({
                    containment: "parent",
                    drag: function (e) {
                        var ui = $(e.target);
                        var x = ui.css('left');
                        var y = ui.css('top');
                        var w = ui.width();
                        var h = ui.height();
                    }
                });
                $('body>div').bind("dragstart", function(event, ui){
                    event.stopPropagation();
                });

            };


        },

        doCropEvent: function (e) {
            var thisBtn = $(e.target);
            thisBtn.attr("disabled", "disabled");
            thisBtn.css({"color": "#000"});

            thisBtn.text('上传中...');

            var $selectCrop = this.dialog.find('.select-recorte');
            var ratioW = this.options.cropRatio.split(':')[0];
            var ratioH = this.options.cropRatio.split(':')[1];
            // 带入新的值
            var data = {};
            data["request"] = "crop";
            data["toCropImgX"] = parseInt($selectCrop.css('left')) * this.options.imgChangeRatio;
            data["toCropImgY"] = parseInt($selectCrop.css('top')) * this.options.imgChangeRatio;
            data["toCropImgW"] = $selectCrop.width() * this.options.imgChangeRatio;
            data["toCropImgH"] = $selectCrop.height() * this.options.imgChangeRatio;
            data["maxWidth"] = $(".maxWidthHeight input[name='maxwidth']").val();
            data["maxHeight"] = $(".maxWidthHeight input[name='maxheight']").val();
            data["ratioW"] = ratioW;
            data["ratioH"] = ratioH;
            var me = this;
            this.options.data = $.extend(this.options.data,data);
            this.uploadAction();
            
        }
    };
    
    // 插件方法
    var methods = {
        clear: function (Options) {
           
        },
        init: function () {
            
            var Options = this.options;
            
            if (Options.url == "") {
                return alert('options.url must be defined');
            }
            
            //  Options.DefaultImageButton = (Options.DefaultImageButton == "") ? Options.PluginFolderOnServer + OptionsIfEmpty.DefaultImageButton : Options.DefaultImageButton;
            if (Options.imgField == "") {
                return alert('options.imgField must be defined');
            }
            //console.log(this);
            this.__buildForm();
            
        },
        
        // we need build a form
        __buildForm: function() {
            var $el = this.$el;
            var options = this.options;
            
            var self = this;
            this.$el.on("change", function (e) {
                var fileVal = e.target.value.replace(/C:\\fakepath\\/i, "");
                var fileExt = fileVal.substring(fileVal.lastIndexOf(".") + 1);
                if(options.extensions.length>1) {
                    var reg = new RegExp('^[' + options.extensions.join('|') + ']+$','i');
                    if (!reg.test(fileExt)) {
                        return options.extensionError();
                    }
                }
                
                options.files = e.target.files;
                
                if(options.enableCrop) {
                    self.imageBoxObj = new ImageBox(e.target.files,options,function() {self.tryAjaxUpload()});
                    return;
                }
                
            });
        },
        
        tryAjaxUpload: function() {
            var self = this;
            var options = this.options;
            /* 裁切图片,将裁切后的图片转化为base64  */
            var base64 = this.clipImage();
            var datas  = {};
            datas[self.options.imgField] = base64;
            /* 附加上传图片参数 */
            if (typeof self.options.ajaxData === 'object') { 
                $.each(this.options.ajaxData, function(key, value){
                    datas[key]= value;
                });
            }//console.log(base64);console.log(datas);console.log(options);
            /* 异步上传 */
            $.ajax({
                url: this.options.url,
                type: 'POST',
                data: datas,
                cache: false,
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                    if(self.options.enableCrop) {
                        self.imageBoxObj.hide();
                        self.imageBoxObj = null;
                    } 
                   self.options.uploadedCallback(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('ERRORS: ' + textStatus);
                }
            });
        },
        
        /* 图片裁切 */
        clipImage : function(){
            var options = this.options;
            var source = options.data.source;
            var nh = source.naturalHeight,
                nw = source.naturalWidth,
                size = nw>nh?nh:nw;
            var ratio = 80 / 100;// 图片裁切后再压缩的比例
            ratio = size>800? 60 / 100 : ratio;
            ratio = size>1000? 40 / 100 : ratio;
            
            var canvas=$('<canvas width="'+options.data.toCropImgW+'" height="'+options.data.toCropImgH+'"></canvas>')[0],
                ctx=canvas.getContext('2d'),
                //scale=nw/this.offset.width,
                x=options.data.toCropImgX,
                y=options.data.toCropImgY,
                w=options.data.toCropImgW,
                h=options.data.toCropImgH;
            
            ctx.drawImage(source,x,y,w,h,0,0,options.data.toCropImgW,options.data.toCropImgH);
            var src=canvas.toDataURL('image/jpeg', ratio);
            //console.log(src);
            return src;
            
        }
        
    };

    Plugin.prototype = methods;

    $.fn[pluginName] = function(option, param) {
        return this.each(function() {
            var $this   = $(this);
            var data    = $this.data(pluginName);
            var options = typeof option == 'object' && option;
            if (!data){ 
              $this.data(pluginName, (data = new Plugin(this, options)))
            }
            if (typeof option == 'string'){
                 data[option](param);
            }
        });
    };

    
    
    $.fn[pluginName].defaults = {
        
        extensions: ['jpg', 'jpeg', 'gif', 'bmp', 'png'],
        extensionError: function() {},
        url:'',
        // upload file name
        Field: "",
        ajaxData: "",
        onSubmit: function() {
            
        },
        // the data you want to pass
        data: {},
        isAjax: true,
        maximumSize: 1024,
        enableMaximumSize: false,
        MaximumSizeError: function() {
            
        },   
        // crop
        enableCrop: true,
        enableResize: true,
        minimumWidthToResize: 1,
        minimumHeightToResize: 1,
        enableButton: false,
        cropRatio: '1:1',
        imgChangeRatio: '',
        uploadedCallback: function (response) {},    

    };
}(jQuery));