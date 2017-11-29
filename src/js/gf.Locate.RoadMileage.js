;
(function ($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfLocateRoadMileage'; //Plugin名稱
    var gfLocateRoadMileage;

    $.ajax({
        url: 'node_modules/select2/dist/css/select2.min.css',
        dataType: 'text',
        cache: true
    }).then(function(data){
        var style = $('<style/>',{ 'text': data });
        $('head').append(style);
    });
    $.ajax({
        url: 'node_modules/gf.locate.roadmileage/src/css/gf.Locate.RoadMileage.css',
        dataType: 'text',
        cache: true
    }).then(function(data){
        var style = $('<style/>',{ 'text': data });
        $('head').append(style);
    });
    //Load dependencies first
    $.when(
        $.ajax({
            url: 'node_modules/select2/dist/js/select2.min.js',
            dataType: 'script',
            cache: true
        })
    )
    .done(function(){
        //建構式
        gfLocateRoadMileage = function (element, options) {

            this.target = element; //html container
            //this.prefix = pluginName + "_" + this.target.attr('id'); //prefix，for identity
            this.opt = {};
            var initResult = this._init(options); //初始化
            if (initResult) {
                //初始化成功之後的動作
                this._style();
                this._event();
                this._subscribeEvents();

                this.target.trigger('onInitComplete');
            }
        };

        //預設參數
        gfLocateRoadMileage.defaults = {
            url: 'http://d32015.swcb.gov.tw/d32d/commons/',
            css: {
                'width': '100%',

                'background-color': '#e3f0db',
                'overflow-y': 'hidden',
                'overflow-x': 'hidden',
            },

            onClick: undefined,
            onInitComplete: undefined

        };

        //方法
        gfLocateRoadMileage.prototype = {
            //私有方法
            _init: function (_options) {
                //合併自訂參數與預設參數
                try {
                    this.opt = $.extend(true, {}, gfLocateRoadMileage.defaults, _options);
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            _style: function () {
                var o = this;
                o.target.css(o.opt.css);

                var row1 = $('<div/>', { 'class': 'gfLocateRoadMileage-Row' });
                var lbl1 = $('<label/>', { 'class': 'gfLocateRoadMileage-Label', 'text': '道路名稱' });
                var sel1 = $('<select/>', { 'class': 'gfLocateRoadMileage-Select gfLocateRoadMileage-Select1' });
                o._getOption({ url: 'getRoad' }, "id", "name", sel1);
                row1.append(lbl1);
                row1.append(sel1);

                var row2 = $('<div/>', { 'class': 'gfLocateRoadMileage-Row' });
                var lbl2 = $('<label/>', { 'class': 'gfLocateRoadMileage-Label', 'text': '里程數' });
                var inp2 = $('<input/>', { 'class': 'gfLocateRoadMileage-Input gfLocateRoadMileage-Input1', 'placeholder': 'ex: 120', 'type': 'text' });
                row2.append(lbl2);
                row2.append(inp2);

                var row3 = $('<div/>', { 'class': 'gfLocateRoadMileage-Row' });
                var btn3 = $('<button/>', { 'class': 'gfLocateRoadMileage-Button', 'text': '定位' });
                row3.append(btn3);

                o.target.append(row1);
                o.target.append(row2);
                o.target.append(row3);

                sel1.select2();
            },
            _event: function () {
                var o = this;
                o.target
                    .find('.gfLocateRoadMileage-Button')
                        .click(function(e){
                            o._getLatLng({
                                name: o.target.find('.gfLocateRoadMileage-Select1').val(),
                                mileage: ((o.target.find('.gfLocateRoadMileage-Input1').val() == '') ? 'all' : o.target.find('.gfLocateRoadMileage-Input1').val())
                            });
                        })
                        .end()
            },

            _getOption: function(_data, _valueField, _textField, _container){
                var o = this;
                $.ajax({
                    url: o.opt.url + _data.url,
                    type: 'GET',
                    dataType: 'xml',
                    success: function(res){
                        var defaultOption = $('<option/>', { value: "請選擇", text: "請選擇" });
                        _container.append(defaultOption);

                        $(res).find("marker").each(function(i){
                            var option = $('<option/>', { value: $(this).attr(_valueField), text: $(this).attr(_textField) });
                            _container.append(option);
                        });
                        _container.select2();
                    }
                })
            },
            _getLatLng: function(_data){
                var o = this;
                $.ajax({
                    url: o.opt.url + 'getRoadXY/' + _data.mileage + '/' + _data.name,
                    type: 'GET',
                    dataType: 'xml',
                    success: function(res){
                        if($(res).find("marker").length > 0){
                            var markers = new Array();
                            $(res).find("marker").each(function(i){
                                markers.push({
                                    id: i,
                                    name: _data.name,
                                    x: $(this).attr("x") * 1,
                                    y: $(this).attr("y") * 1
                                });
                            });
                            o.target.trigger("onClick", {markers: markers});
                        }else{
                            alert("查無資料!!");
                        }
                    }
                })
            },
            //註冊事件接口
            _subscribeEvents: function () {
                //先解除所有事件接口
                this.target.off('onClick');
                this.target.off('onInitComplete');
                //綁定點擊事件接口
                if (typeof (this.opt.onClick) === 'function') {
                    this.target.on('onClick', this.opt.onClick);
                }
                if (typeof (this.opt.onInitComplete) === 'function') {
                    this.target.on('onInitComplete', this.opt.onInitComplete);
                }
            }



        };
    });

    //實例化，揭露方法，回傳
    $.fn[pluginName] = function (options, args) {
        var gfInstance;
        this.each(function () {
            gfInstance = new gfLocateRoadMileage($(this), options);
        });

        return this;
    };
})(jQuery, window, document);