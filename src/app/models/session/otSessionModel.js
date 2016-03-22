(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .provider('otSessionModel', OpenTokSessionProvider);

    function OpenTokSessionProvider(otSubscriberModelProvider, otPublisherModelProvider) {
        var pv = this;
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

        //TODO other options:
        //autoSubscribe


        /**
         * @param{Object} opts
         * @param{Number} opts.apiKey - required
         * @param{Boolean} [opts.autoConnect] - connect to session on initialization - default === true
         * @param{Object} [opts.subscriber] - set default 'targetElement' (ie dom id) and 'targetProperties';
         * @param{Object} [opts.publisher] - set default 'targetElement' (ie dom id) and 'targetProperties';
         * other options see below
         */

        function configure(opts) {
            angular.extend(pv._options, opts);
            if (checkOptions('publisher')) {
                otPublisherModelProvider.configure(pv._options['publisher']);
            }
            if (checkOptions('subscriber')) {
                otSubscriberModelProvider.configure(pv._options['subscriber']);
            }
        }

        function checkOptions(key) {
            var keys = Object.keys(pv._options)
            return keys.indexOf(key) !== -1;
        }


        /** @ngInject */
        function main($q, OTApi, otutil, $log) {
            /**
             * @constructor
             * @param{Object} params
             * @param{String} params.sessionId
             * @param{String} params.token
             */
            return function(params, options) {
                if (!options) {
                    options = {};
                }
                options = angular.merge(options, pv._options)
                if (!options.apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }

                return new OpenTokSession($q, OTApi, otutil, $log, params, options);
            }
        }
    }


    function OpenTokSession(q, api, utils, log, params, options) {
        var self = this;
        self._q = q;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._params = params || {};
        if (checkParamKeys(self._params, 'sessionId')) {
            throw new Error("SessionId must be defined");
        }
        if (checkParamKeys(self._params, 'token')) {
            throw new Error("Token must be defined");
        }
        self._options = self._utils.paramCheck(options, "obj", {});
        self._apiKey = options.apiKey;
        self._sessionId = self._params.sessionId;
        self._token = self._params.token;
        self._autoConnect = self._utils.paramCheck(self._options.autoConnect, 'bool', true);

        if (!self._autoConnect) {
            self.connect = connect;
        }

        self._subscriberParams = self._options.subscriber || null;
        self.connections = [];
        self.streams = [];
        self.publishers = [];

        function initSession(sessionId) {

            return self._api
                .then(setSession)
                .then(checkConnect)
                .catch(standardError);

            function setSession(res) {
                var methodsAndPropsToExtend = ['streams', 'connections', 'publishers', 'on', 'once', 'connect', 'publish', 'signal', 'subscribe', 'forceDisconnect', 'forceUnpublish'];
                self._session = res.initSession(self._apiKey, sessionId)
                var keys = Object.keys(self._session);
                self._q.all(keys.map(function(key) {

                    if (methodsAndPropsToExtend.indexOf(key) === -1) {
                        self[key] = self._session[key];
                    }
                }));
            }

            function checkConnect() {
                if (self._autoConnect) {
                    connect();
                }
                return self;
            }
        }

        function checkParamKeys(obj, str) {
            var keys = self._utils.keys(obj);
            return keys.indexOf(str) === -1;
        }


        // function arrayCheck(args) {
        //     if (!args) {
        //         args = [];
        //     }
        //     if (args && !angular.isArray(args)) {
        //         args = [args]
        //     }

        //     return args;
        // }


        function connect() {
            return self._utils.handler(function(cb) {
                    self._session.connect(self._token, cb);
                })
                .catch(function(err) {
                    return self._utils.standardError(err);
                });
        }


        function standardError(err) {
            return self._utils.standardError(err);
        }

        return initSession(self._sessionId);

    }

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



    function publish(obj) {
        var self = this;

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
