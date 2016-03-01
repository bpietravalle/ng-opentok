(function() {
    'use strict';

    angular.module('ngOpenTok.models.subscriber')
        .provider('OpenTokSubscriber', OpenTokSubscriberProvider);

    function OpenTokSubscriberProvider() {
        var pv = this;
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;


        function configure(opts) {
            angular.extend(pv._options, opts);
        }

        /** @ngInject */
        function main($q, $timeout, OTApi, otutil, $injector) {
            var options = pv._options;
            /**
             * @constructor
             * @param{Object} param - subscriber object returned from session.subscribe
             */
            return function(param) {
                return new OpenTokSubscriber($q, $timeout, OTApi, otutil, $injector, options, param);
            }
        }
    }

    function OpenTokSubscriber(q, timeout, api, utils, injector, options, param) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._injector = injector;
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
