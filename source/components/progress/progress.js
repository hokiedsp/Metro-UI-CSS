var ProgressDefaultConfig = {
    showValue: false,
    showLabel: false,
    labelPosition: "before", // before, after
    labelTemplate: "",
    value: 0,
    buffer: 0,
    type: "bar",
    small: false,
    clsBack: "",
    clsBar: "",
    clsBuffer: "",
    clsValue: "",
    clsLabel: "",
    onValueChange: Metro.noop,
    onBufferChange: Metro.noop,
    onComplete: Metro.noop,
    onBuffered: Metro.noop,
    onProgressCreate: Metro.noop
};

Metro.progressSetup = function (options) {
    ProgressDefaultConfig = $.extend({}, ProgressDefaultConfig, options);
};

if (typeof window["metroProgressSetup"] !== undefined) {
    Metro.progressSetup(window["metroProgressSetup"]);
}

var Progress = {
    init: function( options, elem ) {
        this.options = $.extend( {}, ProgressDefaultConfig, options );
        this.elem  = elem;
        this.element = $(elem);
        this.value = 0;
        this.buffer = 0;

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
        var value;

        Metro.checkRuntime(element, "progress");

        if (typeof o.type === "string") {
            o.type = o.type.toLowerCase();
        }

        element
            .html("")
            .addClass("progress");

        function _progress(){
            $("<div>").addClass("bar").appendTo(element);
        }

        function _buffer(){
            $("<div>").addClass("bar").appendTo(element);
            $("<div>").addClass("buffer").appendTo(element);
        }

        function _load(){
            element.addClass("with-load");
            $("<div>").addClass("bar").appendTo(element);
            $("<div>").addClass("buffer").appendTo(element);
            $("<div>").addClass("load").appendTo(element);
        }

        function _line(){
            element.addClass("line");
        }

        switch (o.type) {
            case "buffer": _buffer(); break;
            case "load": _load(); break;
            case "line": _line(); break;
            default: _progress();
        }

        if (o.type !== 'line') {
            value = $("<span>").addClass("value").addClass(o.clsValue).appendTo(element);
            if (o.showValue === false) {
                value.hide();
            }
        }

        if (o.small === true) {
            element.addClass("small");
        }

        element.addClass(o.clsBack);
        element.find(".bar").addClass(o.clsBar);
        element.find(".buffer").addClass(o.clsBuffer);

        if (o.showLabel === true) {
            var label = $("<span>").addClass("progress-label").addClass(o.clsLabel).html(o.labelTemplate === "" ? o.value : o.labelTemplate.replace("%VAL%", o.value));
            if (o.labelPosition === 'before') {
                label.insertBefore(element);
            } else {
                label.insertAfter(element);
            }
        }

        this.val(o.value);
        this.buff(o.buffer);

        Utils.exec(o.onProgressCreate, null, element[0]);
        element.fire("progresscreate");
    },

    val: function(v){
        var that = this, element = this.element, o = this.options;
        var value = element.find(".value");

        if (v === undefined) {
            return that.value;
        }

        var bar  = element.find(".bar");

        if (bar.length === 0) {
            return false;
        }

        this.value = parseInt(v, 10);

        bar.css("width", this.value + "%");
        value.html(this.value+"%");

        var diff = element.width() - bar.width();
        var valuePosition = value.width() > diff ? {left: "auto", right: diff + 'px'} : {left: v + '%'};

        value.css(valuePosition);

        if (o.showLabel === true) {
            var label = element[o.labelPosition === "before" ? "prev" : "next"](".progress-label");
            if (label.length) {
                label.html(o.labelTemplate === "" ? o.value : o.labelTemplate.replace("%VAL%", o.value));
            }
        }

        Utils.exec(o.onValueChange, [this.value], element[0]);
        element.fire("valuechange", {
            vsl: this.value
        });

        if (this.value === 100) {
            Utils.exec(o.onComplete, [this.value], element[0]);
            element.fire("complete", {
                val: this.value
            });
        }
    },

    buff: function(v){
        var that = this, element = this.element, o = this.options;

        if (v === undefined) {
            return that.buffer;
        }

        var bar  = element.find(".buffer");

        if (bar.length === 0) {
            return false;
        }

        this.buffer = parseInt(v, 10);

        bar.css("width", this.buffer + "%");

        Utils.exec(o.onBufferChange, [this.buffer], element[0]);
        element.fire("bufferchange", {
            val: this.buffer
        });

        if (this.buffer === 100) {
            Utils.exec(o.onBuffered, [this.buffer], element[0]);
            element.fire("buffered", {
                val: this.buffer
            });
        }
    },

    changeValue: function(){
        this.val(this.element.attr('data-value'));
    },

    changeBuffer: function(){
        this.buff(this.element.attr('data-buffer'));
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'data-value': this.changeValue(); break;
            case 'data-buffer': this.changeBuffer(); break;
        }
    },

    destroy: function(){
        return this.element;
    }
};

Metro.plugin('progress', Progress);