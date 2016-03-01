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
        function main($q, $timeout, OTApi, OpenTokSubscriber, otutil, $injector) {
            var apiKey = pv._apiKey;
            /**
             * @constructor
             * @param{Array} params ["params","to","pass","to","session","service"]
             * @param{Object} [ctx] context of method
             */
            return function(params, ctx, options) {
                if (!apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }
                return new OpenTokSession($q, $timeout, OTApi, apiKey, OpenTokSubscriber, otutil, $injector, params, ctx, options);
            }
        }
    }

    function OpenTokSession(q, timeout, api, apiKey, subscriber, utils, injector, params, ctx, options) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._apiKey = apiKey;
        self._subscriber = subscriber;
        self._utils = utils;
        self._injector = injector;
        self._params = params;
        self._ctx = ctx;
        self._options = self._utils.paramCheck(options, "obj", {});
        self._sessionService = self._utils.paramCheck(self._options.sessionService, "str", "media");
        self._sessionIdMethod = self._utils.paramCheck(self._options.sessionIdMethod, "str", "getSessionId");
        self._sessionObject = self._injector.get(self._sessionService);

        self._eventsService = self._utils.paramCheck(self._options.eventsService, "str", "SessionEvents");
        self._eventsManager = self._injector.get(self._eventsService);

        self._publisherService = self._utils.paramCheck(self._options.publisherService, "str", "Publisher");
        self._publisher = self._injector.get(self._publisherService);

        initSession(self._params, self._ctx);

        /**
         * @param{Array} args ["arguments","to","pass"]
         * @param{Object} [ctx] context of method
         */

        function getSessionId(args, ctx) {
            //TODO default ctx?
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

        function initSession(args, ctx) {
            return loadAndGetSessionId(args, ctx)
                .then(completeAction)
                .catch(standardError);

            function completeAction(res) {
                var methodsToChange = ['on', 'once', 'connect', 'publish', 'signal', 'subscribe', 'forceDisconnect', 'forcePublish'];
                self._session = res[0].initSession(self._apiKey, res[1])
                var keys = Object.keys(self._session);
                self._q.all(keys.map(function(key) {
                    if (methodsToChange.indexOf(key) === -1) {
                        self[key] = self._session[key];
                    }
                }));
            }
        }

        function loadAndGetSessionId(args, ctx) {
            return self._q.all([getApi(), getSessionId(args, ctx)]);
        }

        function getApi() {
            return self._api;
        }

    }

    OpenTokSession.prototype.connect = connect;
    OpenTokSession.prototype.subscribe = subscribe;
    OpenTokSession.prototype.publish = publish;
    OpenTokSession.prototype.signal = signal;
    OpenTokSession.prototype.forceUnpublish = forceUnpublish;
    OpenTokSession.prototype.forceDisconnect = forceDisconnect;
    OpenTokSession.prototype.on = on;
    OpenTokSession.prototype.once = once;
    OpenTokSession.prototype.inspect = inspect;
    OpenTokSession.prototype.registerEvents = registerEvents;


    /***************
     * Commands
     * ***********/

    function connect(token) {
        var session = this._session;
        return this._utils.handler(function(cb) {
            session.connect(token, cb);
        });
    }

    function subscribe(stream, targetElem, props) {
        var session = this._session;
        return this._utils.handler(function(cb) {
            session.subscribe(stream, targetElem, props, cb);
        });
    }

    function publish(obj) {
        var session = this._session;
        return this._utils.handler(function(cb) {
            session.publish(obj, cb);
        });
    }

    function signal(data) {
        var session = this._session;
        return this._utils.handler(function(cb) {
            session.signal(data, cb);
        });
    }

    function forceUnpublish(stream) {
        var session = this._session;
        return this._utils.handler(function(cb) {
            session.forceUnpublish(stream, cb);
        });
    }

    function forceDisconnect(connection) {
        var session = this._session;
        return this._utils.handler(function(cb) {
            session.forceDisconnect(connection, cb);
        });
    }

    function registerEvents() {
        return this._eventsManager(this);
    }

    /***************
     * Queries
     * ***********/

    function on(eventName, ctx) {
        var session = this._session;
        if (!ctx) {
            ctx = session;
        }
        return this._utils.eventHandler(function(cb) {
            return session.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var session = this._session;
        if (!ctx) {
            ctx = session;
        }
        return this._utils.eventHandler(function(cb) {
            return session.once(eventName, cb);
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

    function standardError(err) {
        return this._utils.standardError(err);
    }

}.call(this));
