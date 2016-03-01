(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .provider('OpenTokSession', OpenTokSessionProvider);

    function OpenTokSessionProvider() {
        var pv = this;
        pv.setApiKey = setApiKey;
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

        function setApiKey(num) {
            angular.extend(pv._options, {
                apiKey: num
            });
        }

        function configure(opts) {
            angular.extend(pv._options, opts);
        }



        /** @ngInject */
        function main($q, $timeout, OTApi, otutil, $injector) {
            /**
             * @constructor
             * @param{Array} params ["params","to","pass","to","session","service"]
             * @param{Object} [ctx] context of method
             */
            return function(params, ctx, options) {
                if (!options) {
                    options = {};
                }
                options = angular.merge(options, pv._options)
                if (!options.apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }

                return new OpenTokSession($q, $timeout, OTApi, otutil, $injector, params, ctx, options);
            }
        }
    }

    function OpenTokSession(q, timeout, api, utils, injector, params, ctx, options) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._injector = injector;
        self._params = params;
        self._ctx = ctx;
        self._options = self._utils.paramCheck(options, "obj", {});
        self._apiKey = options.apiKey;

        self._sessionService = self._utils.paramCheck(self._options.sessionService, "str", "media");
        self._sessionIdMethod = self._utils.paramCheck(self._options.sessionIdMethod, "str", "getSessionId");
        self._sessionObject = self._injector.get(self._sessionService);

        self._token = self._utils.paramCheck(self._options.token, 'bool', true);

        if (self._token) {
            self._tokenService = self._utils.paramCheck(self._options.tokenService, "str", "participants");
            self._tokenMethod = self._utils.paramCheck(self._options.tokenMethod, "str", "getToken");
            self._tokenObject = self._injector.get(self._tokenService);
            self._getToken = getToken;
        }

        self._eventsService = self._utils.paramCheck(self._options.eventsService, "str", "SessionEvents");
        self._eventsManager = self._injector.get(self._eventsService);

        self._publisherService = self._utils.paramCheck(self._options.publisherService, "str", "publisher");
        self._publisher = self._injector.get(self._publisherService);
        self._publisherParams = self._utils.paramCheck(self._options.publisherParams, 'arr', []);

        self._subscriberService = self._utils.paramCheck(self._options.subscriberService, "str", "subscriber");
        self._subscriberParams = self._utils.paramCheck(self._options.subscriberParams, 'arr', ["SubscriberContainer", {
            height: 300,
            width: 400
        }]);
        self._subscriber = self._injector.get(self._subscriberService);
        initSession(self._params, self._ctx);



        function initSession(args, ctx) {
            return loadAndGetSessionId(args, ctx)
                .then(completeAction)
                .catch(standardError);

            function completeAction(res) {
                var methodsToExtend = ['on', 'once', 'connect', 'publish', 'signal', 'subscribe', 'forceDisconnect', 'forceUnpublish'];
                self._session = res[0].initSession(self._apiKey, res[1])
                var keys = Object.keys(self._session);
                self._q.all(keys.map(function(key) {
                    if (methodsToExtend.indexOf(key) === -1) {
                        self[key] = self._session[key];
                    }
                }));
                self._publisherCTX = self._utils.paramCheck(self._options.publisherCTX, 'obj', self._session);
                self._subscriberCTX = self._utils.paramCheck(self._options.subscriberCTX, 'obj', self._session);
            }
        }

        function loadAndGetSessionId(args, ctx) {
            args = arrayCheck(args);
            return self._q.all([getApi(), getSessionId(args, ctx)]);
        }

        function getSessionId(args, ctx) {
            return self._timeout(function() {
                return self._sessionObject[self._sessionIdMethod].apply(ctx, args);
            });
        }

        function getToken(params, ctx) {
            params = arrayCheck(params);
            return self._timeout(function() {
                return self._tokenObject[self._tokenMethod].apply(ctx, params);
            });
        }

        function arrayCheck(args) {
            if (!args) {
                args = [];
            }
            if (args && !angular.isArray(args)) {
                args = [args]
            }

            return args;
        }

        function getApi() {
            return self._api;
        }

        function standardError(err) {
            return self._utils.standardError(err);
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

    function connect(str, ctx) {
        var self = this;
        if (self._token) {
            return self._getToken(str, ctx)
                .then(submitToken);
        } else {
            return submitToken(str);
        }

        function submitToken(val) {
            return self._utils.handler(function(cb) {
                self._session.connect(val, cb);
            });
        }
    }

    function subscribe(stream, targetElem, props) {
        var self = this;
        if (!stream) {
            throw new Error("No stream object provided");
        }
        if (!targetElem) {
            targetElem = self._subscriberParams[0];
        }
        if (!props) {
            props = self._subscriberParams[1];
        }

        return self._utils.handler(function(cb) {
            return self._session.subscribe(stream, targetElem, props, cb);
        }).then(function(res) {
            self._subscriber.apply(self._subscriberCTX, res);
        });
    }

    function publish(obj) {
        var self = this;
        if (!obj) {
            return initPublisher()
                .then(publishStream);
        }
        return publishStream(obj);

        function initPublisher() {
            return self._publisher.apply(self._publisherCTX, self._publisherParams)
        }

        function publishStream(obj) {
            return self._utils.handler(function(cb) {
                self._session.publish(obj, cb);
            });
        }
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


}.call(this));
