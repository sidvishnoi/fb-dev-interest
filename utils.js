Set.prototype.intersection = function(setB) {
  const intersection = new Set();
  for (const elem of setB) {
    if (this.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
};

// js smooth scroll
// https://jsfiddle.net/s61x7c4e/
function scrollToItem(element, duration = 1000) {
  const getElementY = (el) => window.pageYOffset + el.getBoundingClientRect().top;
  const easing = (t) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
  var startingY = window.pageYOffset;
  var elementY = getElementY(element);
  var targetY = ((document.body.scrollHeight - elementY < window.innerHeight) ? document.body.scrollHeight - window.innerHeight : elementY) - 100;
  var diff = targetY - startingY;
  var start;
  if (!diff) return;
  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;
    var time = timestamp - start;
    var percent = Math.min(time / duration, 1);
    percent = easing(percent);
    window.scrollTo(0, startingY + diff * percent);
    if (time < duration) window.requestAnimationFrame(step);
  });
}

function isScrolledIntoView(el) {
  var elemTop = el.getBoundingClientRect().top;
  var elemBottom = el.getBoundingClientRect().bottom;
  var isVisible = elemTop < window.innerHeight && elemBottom >= 0;
  return isVisible;
}

// https://gist.github.com/skattyadz/1501387
String.prototype.linkify = function() {
  // http://, https://, ftp://
  var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
  // www. sans http:// or https://
  var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  // Email addresses
  var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

  return this
    .replace(urlPattern, '<a href="$&">$&</a>')
    .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
    .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
};

/**
 * Date Format
 * Copyright (c) 2011, marlun78
 * MIT License, https://gist.github.com/marlun78/bd0800cf5e8053ba9f83
 */
(function () {

    'use strict';

    var asUtc = false,
        days = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
        daysAbbr = 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
        designators = 'AM PM'.split(' '),
        defaultFormat = 'MMMM d""x "at" h:mm tt',
        months = 'January February March April May June July August September October November December'.split(' '),
        monthsAbbr = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),

        // The formatting function
        formatDate =(function(){
            var findPatterns = /([dfFhmHMstxyz]+)(?=([^"']*["'][^"']*["'])*[^"']*$)/g,
                getMethod = function (method) {
                    return 'get' + (asUtc ? 'UTC' : '') + method;
                },
                handlers = {
                         d: function () { return this[getMethod('Date')](); },
                        dd: function () { return pad(this[getMethod('Date')]()); },
                       ddd: function () { return getDayName.call(this, true); },
                      dddd: function () { return getDayName.call(this); },
                         f: function () { return pad(pad(this[getMethod('Milliseconds')](), 3), 6, true).substr(0, 1); },
                        ff: function () { return pad(pad(this[getMethod('Milliseconds')](), 3), 6, true).substr(0, 2); },
                       fff: function () { return pad(pad(this[getMethod('Milliseconds')](), 3), 6, true).substr(0, 3); },
                      ffff: function () { return pad(pad(this[getMethod('Milliseconds')](), 3), 6, true).substr(0, 4); },
                     fffff: function () { return pad(pad(this[getMethod('Milliseconds')](), 3), 6, true).substr(0, 5); },
                    ffffff: function () { return pad(pad(this[getMethod('Milliseconds')](), 3), 6, true).substr(0, 6); },
                         F: function () { var r = pad(this[getMethod('Milliseconds')](), 3).substr(0, 1); return r === '0' ? '' : r; },
                        FF: function () { var r = pad(this[getMethod('Milliseconds')](), 3).substr(0, 2); return r === '00' ? '' : r; },
                       FFF: function () { return pad(this[getMethod('Milliseconds')](), 3).substr(0, 3); },
                      FFFF: function () { return handlers.FFF.call(this); },
                     FFFFF: function () { return handlers.FFF.call(this); },
                    FFFFFF: function () { return handlers.FFF.call(this); },
                         h: function () { var h = this[getMethod('Hours')](); return h > 12 ? h - 12 : h; },
                        hh: function () { var h = this[getMethod('Hours')](); return pad(h > 12 ? h - 12 : h); },
                         m: function () { return this[getMethod('Minutes')](); },
                        mm: function () { return pad(this[getMethod('Minutes')]()); },
                         H: function () { return this[getMethod('Hours')](); },
                        HH: function () { return pad(this[getMethod('Hours')]()); },
                         M: function () { return this[getMethod('Month')]() + 1; },
                        MM: function () { return pad(this[getMethod('Month')]() + 1); },
                       MMM: function () { return getMonthName.call(this, true); },
                      MMMM: function () { return getMonthName.call(this); },
                         s: function () { return this[getMethod('Seconds')](); },
                        ss: function () { return pad(this[getMethod('Seconds')]()); },
                        tt: function () { return getDesignator.call(this); },
                         x: function () { return getOrdinal.call(this); },
                         y: function () { var y = this[getMethod('FullYear')](), s = y.toString(); return y < 10 ? y : s.substr(s.length - 2); },
                        yy: function () { return pad(this[getMethod('FullYear')](), 2); },
                       yyy: function () { var y = this[getMethod('FullYear')](), s = y.toString(); return y < 1000 ? pad(y, 3) : s.substr(s.length - 4); },
                      yyyy: function () { return pad(this[getMethod('FullYear')](), 4); },
                     yyyyy: function () { return pad(this[getMethod('FullYear')](), 5); },
                    yyyyyy: function () { return pad(this[getMethod('FullYear')](), 6); },
                         z: function () { var t = this.getTimezoneOffset(); return (t > 0 ? '-' : '+') + Math.abs(t / 60); },
                        zz: function () { var t = this.getTimezoneOffset(); return (t > 0 ? '-' : '+') + pad(Math.abs(t / 60)); },
                       zzz: function () { var t = this.getTimezoneOffset(); return (t > 0 ? '-' : '+') + pad(Math.abs(t / 60)) + ':' + pad((Math.abs(t / 60) % 1) * 60); }
                };

            return function () {
                var self = this, format, settings;
                // Evaluate arguments
                if (typeof arguments[0] === 'string') {
                    format = arguments[0];
                    settings = arguments[1];
                }
                else {
                    format = null;
                    settings = arguments[0];
                }
                // Store any passed settings
                if (settings) {
                    if (typeof settings.asUtc !== 'undefined') asUtc = settings.asUtc;
                    if (settings.days) days = settings.days;
                    if (settings.daysAbbr) daysAbbr = settings.daysAbbr;
                    if (settings.designator) designators = settings.designator;
                    if (settings.format) defaultFormat = settings.format;
                    if (settings.getDateOrdinal) getOrdinal = settings.getDateOrdinal;
                    if (settings.months) months = settings.months;
                    if (settings.monthsAbbr) monthsAbbr = settings.monthsAbbr;
                }
                if (!format) {
                    format = defaultFormat;
                }
                return format.replace(findPatterns, function (match, group1) {
                    var fn = handlers[group1];
                    return typeof fn === 'function' ? fn.call(self) : match;
                }).replace(/["']/g, '');
            };
        }()),


        getDayName = function (asAbbr) {
            var n = this.getDay();
            return asAbbr ? daysAbbr[n] : days[n];
        },

        getMonthName = function (asAbbr) {
            var n = this.getMonth();
            return asAbbr ? monthsAbbr[n] : months[n];
        },

        getOrdinal = (function () {
            var os = 'th st nd rd th'.split(' ');
            return function () {
                var d = this.getDate();
                return (d > 3 && d < 21) ? os[0] : os[Math.min(d % 10, 4)];
            };
        }()),

        getDesignator = function () {
            return this.getHours() >= 12 ? designators[1] : designators[0];
        },

        pad = (function () {
            var p = '000000';
            return function (obj, len, fromRight) {
                return fromRight ?
                    (obj + p).slice(0, len ? Math.min(len, p.length) : 2) :
                    (p + obj).slice(-(len ? Math.min(len, p.length) : 2));
            };
        }());

    // Expose the formatting method
    // As a global function
    //window.formatDate = function (date, format, options) {
    //    if(isNaN(+date) || !date.getDate) throw new Error('Not a valid date');
    //    return formatDate.call(date, format, options);
    //};
    // Or as a method on the Date object
    Date.prototype.format = function (format, options) {
        return formatDate.call(this, format, options);
    };
}());
