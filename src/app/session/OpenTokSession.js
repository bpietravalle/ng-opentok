(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .provider('OpenTokSession', OpenTokSessionProvider);

    //TODO put subscriber and publisher params in config phase of each provider; separate api into two methds for each ['init','getOptions']
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
        self._publisherObject = self._injector.get(self._publisherService);
        self._initializePublisher = initializePublisher;

        self._subscriberService = self._utils.paramCheck(self._options.subscriberService, "str", "subscriber");
        //TODO change to subscriber.getOptions

        self._subscriberObject = self._injector.get(self._subscriberService);
        self._subscriberParams = getSubscriberParams;
        self._initializeSubscriber = initializeSubscriber;


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

        function getSubscriberParams() {
            return self._subscriberObject.getOptions()
        }

        function initializePublisher(target, props) {
            return self._publisherObject(target, props)
                .then(function(obj) {
                    self._publisher = obj;
                    // if (self._multiplePublishers) {
                    //     self._publisher.init(id, obj);
                    // }

                    return self._publisher;
                }).catch(standardError);
        }

        //TODO subscribers

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


    function publish(streamOrElemId, targetProps) {
        var self = this;
        if (angular.isString(streamOrElemId) || angular.isUndefined(streamOrElemId)) {
            return initPublisher(streamOrElemId, targetProps)
                .then(publishStream)
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }
        return publishStream(streamOrElemId);

        function initPublisher(target, props) {
            return self._initializePublisher(target, props)
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
