(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .factory('otSessionModel', otSessionModelFactory)


    /** @ngInject */
    function otSessionModelFactory($q, $timeout, OTApi, otutil, $log, otConfiguration, otStreams) {
        /**
         * @constructor
         * @param{Object} params
         * @param{String} params.sessionId
         * @param{String} params.token
         * @return{Promise<Object>}
         */
        return function(params) {
            return new OpenTokSession($q, $timeout, OTApi, otutil, $log, otConfiguration, otStreams, params);
        }
    }


    function OpenTokSession(q, timeout, api, utils, log, config, streams, params) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._options = config.getSession();
        self._params = params || {};
        if (checkParamKeys(self._params, 'sessionId')) {
            throw new Error("SessionId must be defined");
        }
        if (checkParamKeys(self._params, 'token')) {
            throw new Error("Token must be defined");
        }
        self._apiKey = self._options.apiKey;
        self._sessionId = self._params.sessionId;
        self._token = self._params.token;
        self.autoConnect = self._options.autoConnect;
        self.autoPublish = self._options.autoPublish;
        self.autoSubscribe = self._options.autoSubscribe;
        self.addDefaultEvents = self._options.addDefaultEvents;

        if (!self.autoConnect) {
            self.connect = connect;
        }

        self._subscriberParams = config.getSubscriber() || null;
        self.connections = [];
        self.streams = streams(self);
        self.publisher = {};

        function initSession(sessionId) {

            return self._api
                .then(setSession)
                .then(checkConnect)
                .catch(standardError);

            function setSession(res) {
                var methodsAndPropsToExtend = ['streams', 'connections', 'on', 'once', 'connect', 'publish', 'signal', 'subscribe', 'forceDisconnect', 'forceUnpublish'];
                self._session = res.initSession(self._apiKey, sessionId)
                var keys = self._utils.keys(self._session);
                self._q.all(keys.map(function(key) {
                    if (methodsAndPropsToExtend.indexOf(key) === -1) {
                        self[key] = self._session[key];
                    }
                }));
                self.on = on;
                if (self.addDefaultEvents) {
                    eventDefaults();
                }
            }

            function checkConnect() {
                if (self.autoConnect) {
                    connect();
                }
                return self;
            }
        }

        function checkParamKeys(obj, str) {
            var keys = self._utils.keys(obj);
            return keys.indexOf(str) === -1;
        }


        function connect() {
            return self._utils.handler(function(cb) {
                    self._session.connect(self._token, cb);
                })
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }

        function on(eventName, ctx) {
            if (!ctx) {
                ctx = self._session;
            }
            return self._utils.eventHandler(function(cb) {
                return self._session.on(eventName, cb);
            }, ctx);
        }


        function standardError(err) {
            return self._utils.standardError(err);
        }

        function eventDefaults() {
            self.on({
                'sessionDisconnected': function(event) {
                    self._timeout(function() {
                        self.streams = {};
                        self.connections = {};
                    });
                },
                'streamDestroyed': function(event) {
                    self._timeout(function() {
                        self.streams.remove(event.stream);
                    });
                },
                'streamCreated': function(event) {
                    self._timeout(function() {
                        self.streams.add(event.stream);
                    });
                },
                'connectionCreated': function(event) {
                    self._timeout(function() {
                        self.connections.add(event.connection);
                    });
                },
                'connectionDestroyed': function(event) {
                    self._timeout(function() {
                        self.connections.remove(event.connection);
                    });
                },
            })
        }

        return initSession(self._sessionId);

    }


    OpenTokSession.prototype.subscribe = subscribe;
    OpenTokSession.prototype.publish = publish;
    OpenTokSession.prototype.signal = signal;
    OpenTokSession.prototype.forceUnpublish = forceUnpublish;
    OpenTokSession.prototype.forceDisconnect = forceDisconnect;
    OpenTokSession.prototype.once = once;
    OpenTokSession.prototype.inspect = inspect;


    /***************
     * Commands
     * ***********/


    function subscribe(stream, targetElem, props) {
        var self = this;
        if (!stream) {
            throw new Error("No stream object provided");
        }
        if (!targetElem) targetElem = self._subscriberParams.targetElement;
        if (!props) props = self._subscriberParams.targetProperties;

        return self._utils.handler(function(cb) {
                return self._session.subscribe(stream, targetElem, props, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });

    }

    function publish() {
        var self = this,
            obj = self.publisher;
        if (!obj._publisher) {
            throw new Error("Publisher object is still undefined");
        }

        return self._utils.handler(function(cb) {
                self._session.publish(obj._publisher, cb)
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
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
