(function() {
    'use strict';

    angular.module('ngOpenTok.models.subscriber')
        .provider('otSubscriberModel', OpenTokSubscriberProvider);

    function OpenTokSubscriberProvider() {
        var pv = this;
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

        /**
         * @param{Object} opts
         * @param{Object|String} opts.targetElement Element or dom id
         * @param{Object} opts.targetProperties initial styling of element
         * @summary - currently these must be set here - no opportunity to pass at runtime
         */

        function configure(opts) {
            angular.extend(pv._options, opts);
        }

        /** @ngInject */
        function main($q, otutil) {
            var options = pv._options;

            return {
                init: init,
                getOptions: getOptions
            };

            /**
             * @constructor
             * @param{Object} param - subscriber object returned from session.subscribe
             */

            function init(param) {
                return new OpenTokSubscriber($q, otutil, options, param);
            }

            /**
             * @summary helper method to share default options with sessionObject
             */

            function getOptions() {
                return {
                    targetElement: options.targetElement,
                    targetProperties: options.targetProperties
                };
            }
        }

    }

    function OpenTokSubscriber(q, utils, options, param) {
        var self = this;
        self._q = q;
        self._utils = utils;
        self._options = self._utils.paramCheck(options, "obj", {});
        self._param = param


        function initSubscriber(obj) {
            var methodsToExtend = ['on', 'once', 'getStats'];
            self._subscriber = obj;
            var keys = Object.keys(self._subscriber);
            return self._q.all(keys.map(function(key) {
                if (methodsToExtend.indexOf(key) === -1) {
                    self[key] = self._subscriber[key];
                }
            })).then(function() {
                return self;
            }).catch(standardError);
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }
        return initSubscriber(self._param);

    }

    OpenTokSubscriber.prototype.on = on;
    OpenTokSubscriber.prototype.once = once;
    OpenTokSubscriber.prototype.getStats = getStats;
    OpenTokSubscriber.prototype.inspect = inspect;

    /***************
     * Queries
     * ***********/

    function on(eventName, ctx) {
        var subscriber = this._subscriber;
        if (!ctx) ctx = subscriber;
        return this._utils.eventHandler(function(cb) {
            return subscriber.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var subscriber = this._subscriber;
        if (!ctx) ctx = subscriber;
        return this._utils.eventHandler(function(cb) {
            return subscriber.once(eventName, cb);
        }, ctx);
    }

    function getStats(ctx) {
        var subscriber = this._subscriber;
        if (!ctx) ctx = subscriber;
        return this._utils.handler(function(cb) {
            return subscriber.getStats(cb);
        }, ctx);
    }

    function inspect(item) {
        switch (!item) {
            case true:
                return this;
            case false:
                item = "_" + item;
                return this[item];
        }
    }


}.call(this));
