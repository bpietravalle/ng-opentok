(function() {
    'use strict';

    angular.module('ngOpenTok.models.subscriber')
        .provider('OpenTokSubscriber', OpenTokSubscriberProvider);

    function OpenTokSubscriberProvider() {
        var pv = this,
            defaultElem = 'SubscriberContainer',
            defaultProp = {
                height: 300,
                width: 400
            };
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

        function configure(opts) {
            angular.extend(pv._options, opts);
        }

        /** @ngInject */
        function main($q, otutil) {
            var options = pv._options;
            options.targetElement = otutil.paramCheck(options.targetElement, "str", defaultElem);
            options.targetProperties = otutil.paramCheck(options.targetProperties, "obj", defaultProp);
            return {
                /**
                 * @constructor
                 * @param{Object} param - subscriber object returned from session.subscribe
                 */
                init: function(param) {
                    return new OpenTokSubscriber($q, otutil, options, param);
                },

                /**
                 * @summary helper method to share default options with sessionObject
                 */

                getOptions: function() {
                    return {
                        targetElement: options.targetElement,
                        targetProperties: options.targetProperties
                    };
                }
            };

        }
    }

    function OpenTokSubscriber(q, utils, options, param) {
        var self = this;
        self._q = q;
        self._utils = utils;
        self._options = self._utils.paramCheck(options, "obj", {});
        self._param = param

        initSubscriber(self._param);

        function initSubscriber(obj) {
            var methodsToExtend = ['on', 'once', 'getStats'];
            self._subscriber = obj;
            var keys = Object.keys(self._subscriber);
            self._q.all(keys.map(function(key) {
                if (methodsToExtend.indexOf(key) === -1) {
                    self[key] = self._subscriber[key];
                }
            })).catch(standardError);
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

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
        if (!ctx) {
            ctx = subscriber;
        }
        return this._utils.eventHandler(function(cb) {
            return subscriber.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var subscriber = this._subscriber;
        if (!ctx) {
            ctx = subscriber;
        }
        return this._utils.eventHandler(function(cb) {
            return subscriber.once(eventName, cb);
        }, ctx);
    }

    function getStats(ctx) {
        var subscriber = this._subscriber;
        if (!ctx) {
            ctx = subscriber;
        }
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
