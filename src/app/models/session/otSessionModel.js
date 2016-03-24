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
                .then(function(res) {
                    if (res.sessionEvents) {
                        res.setSessionEvents();
                    }
                    return res;

                })
                .then(function(res) {
                    if (res.autoConnect) {
                        res.connect();
                    }
                    return res;

                });
        }
    }


    function OpenTokSession(q, timeout, injector, api, utils, log, config, streams, connections, params) {
        var self = this;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._options = config.getSession();
        self._params = angular.extend({}, params);
        if (checkParamKeys(self._params, 'sessionId')) {
            standardError("SessionId must be defined");
        }
        if (checkParamKeys(self._params, 'token')) {
            standardError("Token must be defined");
        }
        self._apiKey = self._options.apiKey;
        self._sessionId = self._params.sessionId;
        self._token = self._params.token;
        self.autoConnect = self._options.autoConnect;
        self.autoPublish = self._options.autoPublish;
        self.autoSubscribe = self._options.autoSubscribe;
        self.sessionEvents = self._options.events;

        self._subscriberParams = config.getSubscriber();
        self.connections = connections();
        self.streams = streams();
        self.publisher = {};

        if (self.sessionEvents) {
            self.setSessionEvents = function() {
                timeout(function() {
                    var factory = injector.get(self._options.eventsService);
                    factory.call(self);
                });
            };
        }

        self._log.info(self);

        function initSession(sessionId) {

            return self._api
                .then(setSession)
                .catch(standardError);

            function setSession(res) {
                var methodsAndPropsToExtend = ['streams', 'connections', 'on', 'once', 'connect', 'publish', 'signal', 'subscribe', 'forceDisconnect', 'forceUnpublish'];
                self._session = res.initSession(self._apiKey, sessionId)
                var keys = self._utils.keys(self._session);
                q.all(keys.map(function(key) {
                    if (methodsAndPropsToExtend.indexOf(key) === -1) {
                        self[key] = self._session[key];
                    }
                }));
                return self;
            }

        }

        function checkParamKeys(obj, str) {
            var keys = self._utils.keys(obj);
            return keys.indexOf(str) === -1;
        }


        function standardError(err) {
            return self._utils.standardError(err);
        }

        return initSession(self._sessionId);

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

    function connect() {
        var self = this;
        return self._utils.handler(function(cb) {
                self._session.connect(self._token, cb);
            })
            .catch(function(err) {
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
