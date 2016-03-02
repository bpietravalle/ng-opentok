(function() {
    'use strict'

    angular.module('ngOpenTok', ['ngOpenTok.models', 'ngOpenTok.loader', 'ngOpenTok.utils']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models', ['ngOpenTok.models.subscriber', 'ngOpenTok.models.publisher', 'ngOpenTok.models.session']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.OTApi', ['ngOpenTok.loader']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.loader', ['uuid']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.utils', []);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.publisher', ['ngOpenTok.OTApi', 'ngOpenTok.utils']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.session', ['ngOpenTok.OTApi', 'ngOpenTok.utils']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.subscriber', ['ngOpenTok.utils']);

})();

(function() {
    "use strict";


    OTApiFactory.$inject = ["$q", "$window", "$log", "OTAsyncLoader"];
    angular.module("ngOpenTok.OTApi")
        .factory("OTApi", OTApiFactory);


    /** @ngInject */
    function OTApiFactory($q, $window, $log, OTAsyncLoader) {
        if (angular.isUndefined($window.OT)) {
            $log.info("Opentok Api is not available.  Attempting to load Api now");
            return OTAsyncLoader.load();
        }

        return $q.when($window.OT);
    }


})();

(function() {
    'use strict';

    angular.module('ngOpenTok')
        .directive('otSession', otSessionDirective);

    function otSessionDirective() {

			return {
				restrict: 'AE',
				scope: {
					sessionId: '@'
					// connection: '=',
					// capabilities: '='
				},
				template: "<div class='angular-ot-session'></div>"
			};


    }

})();

(function() {
    'use strict';
    angular.module('ngOpenTok.loader')
        .provider('OTAsyncLoader', OTAsyncLoaderProvider);

    //Inspired by (ie taken from) angular-google-maps - thanks!

    function OTAsyncLoaderProvider() {
        main.$inject = ["$window", "rfc4122", "$q", "OPENTOK_URL"];
        var that = this;
        that.options = {
            transport: 'https'
        };
        that.configure = configure;

        function configure(options) {
            angular.extend(that.options, options);
        }

        that.$get = main;

        /** @ngInject */
        function main($window, rfc4122, $q, OPENTOK_URL) {
            var scriptId = null,
                usedConfiguration = null;

            return {
                load: load
            }

            function isOTLoaded() {
                return angular.isDefined($window.OT);
            }

            function setScript(options) {
                var script, scriptElem;
                if (scriptId) {
                    scriptElem = $window.document.getElementById(scriptId);
                    scriptElem.parentNode.removeChild(scriptElem);
                }
                script = $window.document.createElement('script');
                script.id = scriptId = "opentok_load_" + (rfc4122.v4());
                script.type = 'text/javascript';
                if (options.transport === 'auto') {
                    script.src = OPENTOK_URL;
                } else {
                    script.src = options.transport + ':' + OPENTOK_URL;
                }
                return $window.document.body.appendChild(script);
            }

            function load() {
                var options = that.options,
                    randomizedFunctionName,
                    deferred = $q.defer();
                if (isOTLoaded()) {
                    deferred.resolve($window.OT);
                    return deferred.promise;
                }
                randomizedFunctionName = options.callback = 'onOpenTokReady' + Math.round(Math.random() * 1000);
                $window[randomizedFunctionName] = function() {
                    $window[randomizedFunctionName] = null;
                    deferred.resolve($window.OT);
                };
                setScript(options);
                usedConfiguration = options;
                usedConfiguration.randomizedFunctionName = randomizedFunctionName;
                return deferred.promise;
            }
        }
    }

}.call(this));

(function() {
    'use strict';

    angular.module('ngOpenTok.loader')
        .constant('OPENTOK_URL', "//static.opentok.com/v2/js/opentok.min.js");
})();

(function() {
    "use strict";


    otUtilsFactory.$inject = ["$log", "$q"];
    angular.module("ngOpenTok.utils")
        .factory("otutil", otUtilsFactory);


    /** @ngInject */
    function otUtilsFactory($log, $q) {

        var utils = {
            handler: handler,
            defer: defer,
            paramCheck: paramCheck,
            qWrap: qWrap,
            qAll: qAll,
            eventHandler: eventHandler,
            standardError: standardError
        };

        return utils;

        function paramCheck(param, type, def) {
            switch (angular.isUndefined(param)) {
                case true:
                    return def;
                case false:
                    switch (type) {
                        case "bool":
                            return boolCheck(param);
                        case "str":
                            return strCheck(param);
                        case "arr":
                            return arrCheck(param);
                        case "obj":
                            return hashCheck(param);
                    }
                    break;
            }
        }

        function strCheck(str) {
            switch (angular.isString(str)) {
                case true:
                    return str;
                case false:
                    return invalidType(str);
            }
        }

        function arrCheck(arr) {
            switch (angular.isArray(arr)) {
                case true:
                    return arr;
                case false:
                    return invalidType(arr);
            }
        }

        function boolCheck(bool) {
            var accepted = [false, true];
            switch (accepted.indexOf(bool)) {
                case -1:
                    return invalidType(bool);
                default:
                    return bool;
            }
        }

        function invalidType(type) {
            throw new Error("Invalid parameter type at: " + type);
        }

        function hashCheck(hash) {
            //TODO: iterate over keys and check for and remove unknowns
            return hash;
        }

        function handler(fn, ctx) {
            return utils.defer(function(def) {
                fn.call(ctx, function(err, res) {
                    if (err !== null) {
                        def.reject(err);
                    }
                    return def.resolve(res);
                });
            });
        }

        function defer(fn, ctx) {
            var def = $q.defer();
            fn.call(ctx, def);
            return def.promise;
        }

        /**
         * @param{Function} fn callback
         * @param{Object} [ctx] context
         */

        function eventHandler(fn, ctx) {
            return utils.defer(function(def) {
                fn.call(ctx, function(event) {
                    if (event) {
                        def.resolve(event);
                    } else {
                        def.reject("No event object returned");
                    }
                });
            });
        }


        function qWrap(obj) {
            return $q.when(obj);
        }

        function qAll(x, y) {
            return $q.all([x, qWrap(y)]);
        }

        function standardError(err) {
            return $q.reject(err);
        }

    }



})();

(function() {
    'use strict';

    angular.module('ngOpenTok.models.publisher')
        .provider('OpenTokPublisher', OpenTokPublisherProvider);

    function OpenTokPublisherProvider() {
        main.$inject = ["$q", "$timeout", "OTApi", "otutil", "$injector"];
        var pv = this,
            defaultElem = 'PublisherContainer',
            defaultProp = {
                height: 300,
                width: 400
            };
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

        function configure(opts) {
            angular.extend(pv._options, opts);
        }

        /** @ngInject */
        function main($q, $timeout, OTApi, otutil, $injector) {
            var options = pv._options;
            options.targetElement = otutil.paramCheck(options.targetElement, "str", defaultElem);
            options.targetProperties = otutil.paramCheck(options.targetProperties, "obj", defaultProp);

            /**
             * @constructor
             * @param{String} targetElement - DOM id of publisher object
             * @param{Object} props - properties of publisher object
             */
            return function(targetElement, props) {
                return new OpenTokPublisher($q, $timeout, OTApi, otutil, $injector, options, targetElement, props);
            }
        }
    }

    function OpenTokPublisher(q, timeout, api, utils, injector, options, targetElement, props) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._injector = injector;
        self._options = self._utils.paramCheck(options, "obj", {});

        self._targetElement = self._utils.paramCheck(targetElement, "str", self._options.targetElement);
        self._props = self._utils.paramCheck(props, "obj", self._options.targetProperties);

        initPublisher(self._targetElement, self._props);

        function initPublisher(elem, props) {
            return getApi()
                .then(completeAction)
                .catch(standardError);

            function completeAction(res) {
                var methodsToExtend = ['on', 'once'];
                self._publisher = res.initPublisher(elem, props)
                var keys = Object.keys(self._publisher);
                self._q.all(keys.map(function(key) {
                    if (methodsToExtend.indexOf(key) === -1) {
                        self[key] = self._publisher[key];
                    }
                }));
            }
        }

        function getApi() {
            return self._api;
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

    }

    OpenTokPublisher.prototype.on = on;
    OpenTokPublisher.prototype.once = once;
    OpenTokPublisher.prototype.inspect = inspect;

    /***************
     * Queries
     * ***********/

    function on(eventName, ctx) {
        var publisher = this._publisher;
        if (!ctx) {
            ctx = publisher;
        }
        return this._utils.eventHandler(function(cb) {
            return publisher.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var publisher = this._publisher;
        if (!ctx) {
            ctx = publisher;
        }
        return this._utils.eventHandler(function(cb) {
            return publisher.once(eventName, cb);
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

(function() {
    'use strict';

    angular.module('ngOpenTok.models.session')
        .provider('OpenTokSession', OpenTokSessionProvider);

    function OpenTokSessionProvider() {
        main.$inject = ["$q", "$timeout", "OTApi", "otutil", "$injector"];
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

        self._session = self._utils.paramCheck(self._options.session, 'bool', true);

        self._token = self._utils.paramCheck(self._options.token, 'bool', true);

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

        self._eventsService = self._utils.paramCheck(self._options.eventsService, "str", "SessionEvents");
        self._eventsManager = self._injector.get(self._eventsService);

        self._publisherService = self._utils.paramCheck(self._options.publisherService, "str", "publisher");
        self._publisherObject = self._injector.get(self._publisherService);
        self._initializePublisher = initializePublisher;

        self._subscriberService = self._utils.paramCheck(self._options.subscriberService, "str", "subscriber");
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

(function() {
    'use strict';

    angular.module('ngOpenTok.models.subscriber')
        .provider('OpenTokSubscriber', OpenTokSubscriberProvider);

    function OpenTokSubscriberProvider() {
        main.$inject = ["$q", "otutil"];
        var pv = this,
            defaultElem = 'SubscriberContainer',
            defaultProp = {
                height: 300,
                width: 400
            };
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

        function configure(opts) {
            angular.extend(pv._options, opts);
        }

        /** @ngInject */
        function main($q, otutil) {
            var options = pv._options;
            options.targetElement = otutil.paramCheck(options.targetElement, "str", defaultElem);
            options.targetProperties = otutil.paramCheck(options.targetProperties, "obj", defaultProp);
            return {
                /**
                 * @constructor
                 * @param{Object} param - subscriber object returned from session.subscribe
                 */
                init: function(param) {
                    return new OpenTokSubscriber($q, otutil, options, param);
                },

                /**
                 * @summary helper method to share default options with sessionObject
                 */

                getOptions: function() {
                    return {
                        targetElement: options.targetElement,
                        targetProperties: options.targetProperties
                    };
                }
            };

        }
    }

    function OpenTokSubscriber(q, utils, options, param) {
        var self = this;
        self._q = q;
        self._utils = utils;
        self._options = self._utils.paramCheck(options, "obj", {});
        self._param = param

        initSubscriber(self._param);

        function initSubscriber(obj) {
            var methodsToExtend = ['on', 'once', 'getStats'];
            self._subscriber = obj;
            var keys = Object.keys(self._subscriber);
            self._q.all(keys.map(function(key) {
                if (methodsToExtend.indexOf(key) === -1) {
                    self[key] = self._subscriber[key];
                }
            })).catch(standardError);
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

    }

    OpenTokSubscriber.prototype.on = on;
    OpenTokSubscriber.prototype.once = once;
    OpenTokSubscriber.prototype.getStats = getStats;
    OpenTokSubscriber.prototype.inspect = inspect;

    /***************
     * Queries
     * ***********/

    function on(eventName, ctx) {
        var subscriber = this._subscriber;
        if (!ctx) {
            ctx = subscriber;
        }
        return this._utils.eventHandler(function(cb) {
            return subscriber.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var subscriber = this._subscriber;
        if (!ctx) {
            ctx = subscriber;
        }
        return this._utils.eventHandler(function(cb) {
            return subscriber.once(eventName, cb);
        }, ctx);
    }

    function getStats(ctx) {
        var subscriber = this._subscriber;
        if (!ctx) {
            ctx = subscriber;
        }
        return this._utils.handler(function(cb) {
            return subscriber.getStats(cb);
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
