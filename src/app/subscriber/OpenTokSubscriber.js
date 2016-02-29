(function() {
    'use strict';

    angular.module('ngOpenTok.models.subscriber')
        .provider('OpenTokSubscriber', OpenTokSubscriberProvider);

    function OpenTokSubscriberProvider() {
        var pv = this;
        pv.setApiKey = setApiKey;
        pv.$get = main;
				
				function setApiKey(num) {
            pv._apiKey = num;
        }

        /** @ngInject */
        function main($q, OTAsyncLoader, $timeout, $window, otutil) {

            return function(options) {
                var apiKey = pv._apiKey,
                    key = new OpenTokSubscriber($q, OTAsyncLoader, $timeout, $window, apiKey, otutil, options);
                return key.construct();
            }
        }
    }

    function OpenTokSubscriber(q, loader, timeout, win, apiKey, utils, options) {
        this._q = q;
        this._loader = loader;
        this._timeout = timeout;
        this._window = win;
        this._apiKey = apiKey;
        this._utils = utils;
        this._options = options;
        this._sessionIdMethod = this._options.sessionIdMethod;
        this._tokenMethod = this._options.tokenMethod;
        this._sessionIdService = this._options.sessionIdService;
        this._tokenService = this._options.tokenService;
    }
    OpenTokSubscriber.prototype = {
        // construct: function() {
        //     var self = this;
        //     var entity = {};

        //     entity.getSubscriberId = getSubscriberId;
        //     entity.getToken = getToken;
        //     entity.initSubscriber = initSubscriber;
        //     entity.loadAndGetSubscriberId = loadAndGetSubscriberId;
        //     entity.inspect = inspect;

        //     function getSubscriberId(args, ctx) {
        //         return self._timeout(function() {
        //             return self._sessionIdService[self._sessionIdMethod].apply(ctx, args);
        //         });
        //     }

        //     function getToken(args, ctx) {
        //         return self._timeout(function() {
        //             return self._tokenService[self._tokenMethod].apply(ctx, args);
        //         });
        //     }

        //     function loadAndGetSubscriberId(args, ctx) {
        //         return self._q.all([load(), getSubscriberId(args, ctx)]);
        //     }

        //     function initSubscriber(str) {
        //         return self._utils.handler(function(cb) {
        //             return self._window.OT.initSubscriber(self._apiKey, str, cb)
        //         });
        //     }

        //     function load() {
        //         return self._loader.load();
        //     }

        //     function inspect() {}

        //     self._entity = entity;
        //     return self._entity;
        // }
    }
}.call(this));
