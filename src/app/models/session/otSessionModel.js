(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .factory('otSessionModel', otSessionModelFactory)


    /** @ngInject */
    function otSessionModelFactory($q, $timeout, $injector, OTApi, otutil, $log, otConfiguration, otStreams, otConnections) {
        /**
         * @constructor
         * @param{Object} params
         * @param{String} params.sessionId
         * @param{String} params.token
         * @return{Promise<Object>}
         */
        return function(params) {
            return new OpenTokSession($q, $timeout, $injector, OTApi, otutil, $log, otConfiguration, otStreams, otConnections, params)
                // .then(function(res) {
                //to remove;
                // if (res.autoConnect) {
                //     return res.connect();
                // }
                // .catch(function(err) {
                //     return $q.reject(err);
                // });
        }
    }


    function OpenTokSession(q, timeout, injector, api, utils, log, config, streams, connections, params) {
        var self = this;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._options = config.getSession();
        if (checkParamKeys(params, 'sessionId')) {
            standardError("SessionId must be defined");
        }
        if (checkParamKeys(params, 'token')) {
            standardError("Token must be defined");
        }
        self._apiKey = self._options.apiKey;
        // self.autoConnect = self._options.autoConnect;
        self.autoPublish = self._options.autoPublish;
        self.autoSubscribe = self._options.autoSubscribe;
        self.sessionEvents = self._options.events;
        self.connect = connect;

        self._subscriberParams = config.getSubscriber();
        self.connections = connections();
        self.streams = streams();
        self.publisher = {};
        if (angular.isArray(params.sessionId)) {
            self._sessionService = self._utils.paramCheck(self._options.sessionService, "str", "media");
            self._sessionIdMethod = self._utils.paramCheck(self._options.sessionIdMethod, "str", "getSessionId");
            self._sessionObject = injector.get(self._sessionService);
        }


        if (angular.isArray(params.token)) {
            self._tokenService = self._utils.paramCheck(self._options.tokenService, "str", "participants");
            self._tokenMethod = self._utils.paramCheck(self._options.tokenMethod, "str", "getToken");
            self._tokenObject = injector.get(self._tokenService);
            // self._getToken = getToken;
        }

        // function getCTX(arg) {
        //     if (angular.isUndefined(arg)) {
        //         return null;
        //     }
        //     return arg;
        // }

        function initSession() {
            self._log.info(self._sessionObject);

            return q.all([getApi(), getSessionId(params.sessionId), getToken(params.token)])
                .then(setSession)
                .then(function() {
                    return self;
                })
                .catch(standardError);

            function setSession(res) {
                self._sessionId = res[1];
                self._token = res[2];
                var methodsAndPropsToExtend = ['streams', 'connections', 'on', 'once', 'connect', 'publish', 'signal', 'subscribe', 'forceDisconnect', 'forceUnpublish'];
                self._session = res[0].initSession(self._apiKey, self._sessionId)
                var keys = self._utils.keys(self._session);
                q.all(keys.map(function(key) {
                    if (methodsAndPropsToExtend.indexOf(key) === -1) {
                        self[key] = self._session[key];
                    }
                }));
                connect();
            }

        }

        function setReturnVal(res, type) {
            if (!angular.isString(res)) {
                throw new Error("Invalid " + type + ": " + res);
            }
            return res;
        }

        function getSessionId(args) {
            if (angular.isString(args)) {
                return q.when(args);
            }
            args = arrayCheck(args);
            return timeout(function() {
                return self._sessionObject[self._sessionIdMethod].apply(null, args);
            }).then(function(res) {
                return setReturnVal(res, 'sessionId');
            });
        }

        function getApi() {
            return self._api;
        }

        function getToken(args) {
            if (angular.isString(args)) {
                return q.when(args);
            }
            args = arrayCheck(args);
            return timeout(function() {
                return self._tokenObject[self._tokenMethod].apply(null, args);
            }).then(function(res) {
                return setReturnVal(res, 'token');
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

        function connect() {
            return self._utils.handler(function(cb) {
                    self._session.connect(self._token, cb);
                })
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }


        function checkParamKeys(obj, str) {
            var keys = self._utils.keys(obj);
            return keys.indexOf(str) === -1;
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

        return initSession();

    }


    OpenTokSession.prototype.setPublisher = setPublisher;
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


    /**
     * @param{Object} stream - child of self.streams
     */

    function subscribe(stream, targetElem, props) {
        var self = this;
        if (!stream) {
            throw new Error("No stream object provided");
        }
        if (!targetElem) targetElem = self._subscriberParams.targetElement;
        if (!props) props = self._subscriberParams.targetProperties;

        return self._utils.handler(function(cb) {
            self._session.subscribe(stream.main, targetElem, props, cb);
        }).catch(function(err) {
            return self._utils.standardError(err);
        });
    }


    function publish(obj) {
        var self = this;
        if (!obj) {
            obj = self.publisher._publisher;
            if (!obj) throw new Error("Publisher is undefined");
        }

        return self._utils.handler(function(cb) {
                self._session.publish(obj, cb)
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }




    function signal(data) {
        var self = this;
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.signal(data, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }

    function forceUnpublish(stream) {
        var self = this;
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.forceUnpublish(stream, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }

    function forceDisconnect(connection) {
        var self = this;
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.forceDisconnect(connection, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }

    function setPublisher(obj) {
        var self = this;
        self._timeout(function() {
            self.publisher = obj;
        });
    }



    /***************
     * Queries
     * ***********/
    function on(eventName, ctx) {
        var self = this;
        if (!ctx) {
            ctx = self._session;
        }
        return self._utils.eventHandler(function(cb) {
            return self._session.on(eventName, cb);
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
