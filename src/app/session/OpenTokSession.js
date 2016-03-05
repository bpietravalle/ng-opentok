(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .provider('openTokSession', OpenTokSessionProvider);

    function OpenTokSessionProvider(openTokPublisherProvider, openTokSubscriberProvider) {
        var pv = this;
        pv.setApiKey = setApiKey;
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;
        pv.configurePublisher = configurePublisher;
        pv.configureSubscriber = configureSubscriber;

        function setApiKey(num) {
            angular.extend(pv._options, {
                apiKey: num
            });
        }

        function configure(opts) {
            angular.extend(pv._options, opts);
        }

        function configureSubscriber(opts) {
            openTokSubscriberProvider.configure(opts)
        }

        function configurePublisher(opts) {
            openTokPublisherProvider.configure(opts)
        }

        /** @ngInject */
        function main($q, $timeout, OTApi, otutil, $injector, openTokSubscriber, openTokPublisher, $log) {
            /**
             * @constructor
             * @param{Array|String} paramsOrSessionId if you set session: true in config phase then
             * ["params","to","pass","to","session","service"].  Otherwise this is the sessionId
             * @param{Object} [ctx] context of method - only used if you set sesion: true in config phase
             */
            return function(paramsOrSessionId, ctx, options) {
                if (!options) {
                    options = {};
                }
                options = angular.merge(options, pv._options)
                if (!options.apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }

                return new OpenTokSession($q, $timeout, OTApi, otutil, $injector, openTokSubscriber, openTokPublisher, $log, paramsOrSessionId, ctx, options);
            }
        }
    }

    /*
     * false = default
     * add setOptions to publisher
     */

    function OpenTokSession(q, timeout, api, utils, injector, subscriber, publisher, log, params, ctx, options) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._injector = injector;
        self._subscriberObject = subscriber
        self._publisherObject = publisher
        self._log = log;
        self._params = params;
        self._ctx = ctx;
        self._options = self._utils.paramCheck(options, "obj", {});
        self._apiKey = options.apiKey;
        self._session = self._utils.paramCheck(self._options.session, 'bool', false);
        self._token = self._utils.paramCheck(self._options.token, 'bool', false);

        if (self._token) {
            self._autoConnect = self._utils.paramCheck(self._options.autoConnect, 'bool', true);
        }

        if (self._session) {
            self._sessionService = self._utils.paramCheck(self._options.sessionService, "str", "media");
            self._sessionIdMethod = self._utils.paramCheck(self._options.sessionIdMethod, "str", "getSessionId");
            self._sessionObject = self._injector.get(self._sessionService);
        }


        if (self._token) {
            self._tokenService = self._utils.paramCheck(self._options.tokenService, "str", "participants");
            self._tokenMethod = self._utils.paramCheck(self._options.tokenMethod, "str", "getToken");
            self._tokenObject = self._injector.get(self._tokenService);
            self._getToken = getToken;
        }

        self._initializePublisher = initializePublisher;

        self._subscriberParams = getSubscriberParams;
        self._initializeSubscriber = initializeSubscriber;


        function getCTX(arg) {
            if (angular.isUndefined(arg)) {
                return null;
            }
            return arg;
        }


        function initSession(args, ctx) {
            return loadAndGetSessionId(args, ctx)
                .then(completeAction)
                // .then(returnVal)
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

                // if(self._autoConnect){
                //   self._session.
                // }
            }

            // function returnVal() {
            //     return self._session;
            // }

        }

        function loadAndGetSessionId(args, ctx) {
            return self._q.all([getApi(), getSessionId(args, ctx)]);
        }

        function getSessionId(args, ctx) {
            if (self._session) {
                args = arrayCheck(args);
                return self._timeout(function() {
                    return self._sessionObject[self._sessionIdMethod].apply(ctx, args);
                });
            }
            return self._q.when(args);
        }

        function getToken(params, ctx) {
            ctx = getCTX(ctx);
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

        function getSubscriberParams() {
            return self._subscriberObject.getOptions()
        }

        function initializePublisher() {
            return self._publisherObject.init()
                .then(function(obj) {
                    self._publisher = obj;
                    return self._publisher;
                }).catch(standardError);
        }


        function initializeSubscriber(params) {
            return self._subscriberObject.init(params)
                .then(function(obj) {
                    self._subscriber = obj;
                    // if (self._multipleSubscribers) {
                    //     self._subscribers.init(id, obj);
                    // }

                    return self._subscriber;
                }).catch(standardError);
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

        initSession(self._params, getCTX(self._ctx));

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


    /***************
     * Commands
     * ***********/

    function connect(str, ctx) {
        var self = this;
        if (self._token) {
            return self._getToken(str, ctx)
                .then(submitToken)
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }
        return submitToken(str);

        function submitToken(val) {
            return self._utils.handler(function(cb) {
                    self._session.connect(val, cb);
                })
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }
    }

    function subscribe(stream, targetElem, props) {
        var self = this;
        if (!stream) {
            throw new Error("No stream object provided");
        }
        if (!targetElem) {
            targetElem = self._subscriberParams().targetElement;
        }
        if (!props) {
            props = self._subscriberParams().targetProperties;
        }

        return self._utils.handler(function(cb) {
                return self._session.subscribe(stream, targetElem, props, cb);
            })
            .then(initializeSubscriber)
            .catch(function(err) {
                return self._utils.standardError(err);
            });

        function initializeSubscriber(res) {
            return self._initializeSubscriber(res);
        }
    }



    function publish(publisher) {
        var self = this;

        if (angular.isUndefined(publisher)) {
            return initPublisher()
                .then(publishStream)
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }
        return publishStream(publisher);

        function initPublisher() {
            return self._initializePublisher()
        }

        function publishStream(obj) {
            return self._utils.handler(function(cb) {
                    self._session.publish(obj, cb)
                })
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }
    }

    function signal(data) {
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.signal(data, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }

    function forceUnpublish(stream) {
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.forceUnpublish(stream, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }

    function forceDisconnect(connection) {
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.forceDisconnect(connection, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
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
