var ActivityDefaultConfig = {
    type: "ring",
    style: "light",
    size: 64,
    radius: 20,
    onActivityCreate: Metro.noop
};

Metro.activitySetup = function(options){
    ActivityDefaultConfig = $.extend({}, ActivityDefaultConfig, options);
};

if (typeof window["metroActivitySetup"] !== undefined) {
    Metro.activitySetup(window["metroActivitySetup"]);
}

var Activity = {
    init: function( options, elem ) {
        this.options = $.extend( {}, ActivityDefaultConfig, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    _setOptionsFromDOM: function(){
        var element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = JSON.parse(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var element = this.element, o = this.options;
        var i, wrap;

        Metro.checkRuntime(element, "activity");

        element
            .html('')
            .addClass(o.style + "-style")
            .addClass("activity-" + o.type);

        function _metro(){
            for(i = 0; i < 5 ; i++) {
                $("<div/>").addClass('circle').appendTo(element);
            }
        }

        function _square(){
            for(i = 0; i < 4 ; i++) {
                $("<div/>").addClass('square').appendTo(element);
            }
        }

        function _cycle(){
            $("<div/>").addClass('cycle').appendTo(element);
        }

        function _ring(){
            for(i = 0; i < 5 ; i++) {
                wrap = $("<div/>").addClass('wrap').appendTo(element);
                $("<div/>").addClass('circle').appendTo(wrap);
            }
        }

        function _simple(){
            $('<svg class="circular"><circle class="path" cx="'+o.size/2+'" cy="'+o.size/2+'" r="'+o.radius+'" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg>').appendTo(element);
        }

        switch (o.type) {
            case 'metro': _metro(); break;
            case 'square': _square(); break;
            case 'cycle': _cycle(); break;
            case 'simple': _simple(); break;
            default: _ring();
        }

        Utils.exec(this.options.onActivityCreate, [this.element]);
        element.fire("activitycreate")
    },

    changeAttribute: function(attributeName){
    },

    destroy: function(){
        return this.element;
    }
};

Metro.plugin('activity', Activity);

Metro['activity'] = {
    open: function(options){

        var activity = '<div data-role="activity" data-type="'+( options.type ? options.type : 'cycle' )+'" data-style="'+( options.style ? options.style : 'color' )+'"></div>';
        var text = options.text ? '<div class="text-center">'+options.text+'</div>' : '';

        return Metro.dialog.create({
            content: activity + text,
            defaultAction: false,
            clsContent: "d-flex flex-column flex-justify-center flex-align-center bg-transparent no-shadow w-auto",
            clsDialog: "no-border no-shadow bg-transparent global-dialog",
            autoHide: options.autoHide ? options.autoHide : 0,
            overlayClickClose: options.overlayClickClose === true,
            overlayColor: options.overlayColor?options.overlayColor:'#000000',
            overlayAlpha: options.overlayAlpha?options.overlayAlpha:.5,
            clsOverlay: "global-overlay"
        })
    },

    close: function(a){
        Metro.dialog.close(a);
    }
};