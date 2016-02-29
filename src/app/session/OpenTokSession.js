(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .provider('OpenTokSession', OpenTokSessionProvider);

    function OpenTokSessionProvider() {
        var pv = this;
        pv.setApiKey = setApiKey;
        pv.$get = main;

        function setApiKey(num) {
            pv._apiKey = num;
        }

        /** @ngInject */
        function main($q, $timeout, OTApi, OpenTokPublisher, OpenTokSubscriber, otutil, $injector) {
            var key, apiKey = pv._apiKey;
            return function(options) {
                if (!apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }
                key = new OpenTokSession($q, $timeout, OTApi, apiKey, OpenTokPublisher, OpenTokSubscriber, otutil, $injector, options);
                return key.construct();
            }
        }
    }

    function OpenTokSession(q, timeout, api, apiKey, publisher, subscriber, utils, injector, options) {
        this._q = q;
        this._timeout = timeout;
        this._api = api;
        this._apiKey = apiKey;
        this._publisher = publisher;
        this._subscriber = subscriber;
        this._utils = utils;
        this._injector = injector;
        this._options = this._utils.paramCheck(options, "obj", {});
        this._sessionService = this._utils.paramCheck(this._options.sessionService, "str", "media");
        this._sessionIdMethod = this._utils.paramCheck(this._options.sessionIdMethod, "str", "getSessionId");
        this._sessionObject = this._injector.get(this._sessionService);
        // this._tokenService = this._utils.paramCheck(this._options.tokenService, "str", "token");
        // this._tokenIdMethod = this._utils.paramCheck(this._options.tokenIdMethod, "str", "getId");
        // this._tokenObject = this._injector.get(this._tokenService);
    }

    OpenTokSession.prototype = {
        construct: function() {
            var self = this;
            var entity = {};

            // entity.getSessionId = getSessionId;
            entity.initSession = initSession;
            entity.inspect = inspect;

            /**
             * @param{Array} args ["arguments","to","pass"]
             * @param{Object} [ctx] context of method
             */

            function getSessionId(args, ctx) {
                if (!ctx) {
                    ctx = null;
                }
                if (!args) {
                    args = [];
                }
                if (args && !angular.isArray(args)) {
                    args = [args]
                }
                return self._timeout(function() {
                    return self._sessionObject[self._sessionIdMethod].apply(ctx, args);
                });
            }

            // function getToken(args, ctx) {
            //     return self._timeout(function() {
            //         return self._tokenService[self._tokenMethod].apply(ctx, args);
            //     });
            // }


            function initSession(args, ctx) {
                return loadAndGetSessionId(args, ctx)
                    .then(completeAction)

                function completeAction(res) {
                    return self._utils.handler(function(cb) {
                        return res[0].initSession(self._apiKey, res[1], cb)
                    });
                }
            }

            function loadAndGetSessionId(args, ctx) {
                return self._q.all([getApi(), getSessionId(args, ctx)]);
            }

            function getApi() {
                return self._api;
            }

            function inspect(item) {
                switch (!item) {
                    case true:
                        return self;
                    case false:
                        item = "_" + item;
                        return self[item];
                }
            }
            self._entity = entity;
            return self._entity;
        }
    }
}.call(this));
