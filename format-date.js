/**
 * Date Format
 * Copyright (c) 2011, marlun78
 * MIT License, https://gist.github.com/marlun78/bd0800cf5e8053ba9f83
 *
 * Format options inspired by the .NET framework's format.
 * http://msdn.microsoft.com/en-us/library/8kb3ddd4.aspx
 *
 * Non-formatting characters within the format string must be
 * quoted (single (') or double (") quotes)! The same is true
 * for two format specifiers that should apear together. Eg.
 * if you want the date to be output with the date ordinal
 * (9th), the format string must be "d''x" (or 'd""x').
 *
 * Arguments:
 *     format   {String} The format pattern to display the date in. See Format Patterns section below for options.
 *     settings {Object} Formatting settings.
 *
 * Settings:
 *     asUtc      {Boolean} If the formatted date is to be returned as a UTC date.
 *     days       {Array}   The days of the week. Starting with Sunday.
 *     daysAbbr   {Array}   The days of the week, abbreviated. Starting with Sunday.
 *     designator {Array}   Time designator. Starting with AM.
 *     format     {String}  The format pattern to format the date in.
 *     months     {Array}   The name of the months. Starting with January.
 *     monthsAbbr {Array}   The name of the months, abbreviated. Starting with January.
 *
 * Format Patterns:
 *      d       1-31                The day of the month
 *      dd      01-31               The day of the month
 *      ddd     Mon-Sun             The abbreviated name of the day of the week
 *      dddd    Monday-Sunday       The full name of the day of the week
 *      f       6                   The tenths of a second in a date and time value. The remaining digits are truncated.
 *      ff      61                  The hundredths of a second in a date and time value. The remaining digits are truncated.
 *      fff     617                 The milliseconds in a date and time value. The remaining digits are truncated.
 *      ffff    6170                The milliseconds in a date and time value, with a trailing zero. The remaining digits are truncated.
 *      fffff   61700               The milliseconds in a date and time value, with two trailing zeros. The remaining digits are truncated.
 *      ffffff  617000              The milliseconds in a date and time value, with three trailing zeros. The remaining digits are truncated.
 *      F       6                   The tenths of a second in a date and time value. Trailing zeros or zero values are not displayed.
 *      FF      61                  The hundredths of a second in a date and time value. Trailing zeros or zero values are not displayed.
 *      FFF     617                 The milliseconds in a date and time value. Trailing zeros or zero values are not displayed.
 *      FFFF    617                 The milliseconds in a date and time value. Trailing zeros or zero values are not displayed.
 *      FFFFF   617                 The milliseconds in a date and time value. Trailing zeros or zero values are not displayed.
 *      FFFFFF  617                 The milliseconds in a date and time value. Trailing zeros or zero values are not displayed.
 *      h       1-12                The hour, using a 12-hour clock
 *      hh      01-12               The hour, using a 12-hour clock
 *      H       0-23                The hour, using a 24-hour clock
 *      HH      00-23               The hour, using a 24-hour clock
 *      m       0-59                The minute
 *      mm      00-59               The minute
 *      M       1-12                The month
 *      MM      01-12               The month
 *      MMM     Jan-Dec             The abbreviated name of the month
 *      MMMM    January-December    The full name of the month
 *      s       0-59                The second
 *      ss      00-59               The second
 *      tt      AM/PM               The AM/PM designator
 *      x       st, nd, rd, th      The ordinal suffix of a number (NOTE! This does not exist in .NET!)
 *      y       0-99                The year
 *      yy      00-99               The year
 *      yyy     001-9999            The year, with a minimum of three digits
 *      yyyy    0001-9999           The year as a four-digit number
 *      z       +1                  Hours offset from UTC, with no leading zeros.
 *      zz      +01                 Hours offset from UTC, with a leading zero for a single-digit value.
 *      zzz     +01:00              Hours and minutes offset from UTC.
 *
 * Example:
 *     The formatting method can be called in the following three ways:
 *     formatDate(format, settings) {String} The format string passed is used, any settings are stored.
 *                                           If the settings object contain a format property, it will override the format string.
 *     formatDate(settings)         {String} Settings are stored and the stored format is used.
 *     formatDate()                 {String} Default settings are used.
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