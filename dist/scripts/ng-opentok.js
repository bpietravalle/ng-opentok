(function() {
    'use strict'

    angular.module('ngOpenTok', ['ngOpenTok.models', 'ngOpenTok.directives', 'ngOpenTok.loader', 'ngOpenTok.utils']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.OTApi', ['ngOpenTok.loader']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.directives', ['ngOpenTok.directives.session', 'ngOpenTok.directives.subscriber', 'ngOpenTok.directives.publisher']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.loader', ['uuid']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models', ['ngOpenTok.models.subscriber', 'ngOpenTok.models.publisher', 'ngOpenTok.models.session']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.utils', []);

})();

(function() {
    'use strict'
    angular.module('ngOpenTok.directives.session', ['ngOpenTok.models.session', 'ngOpenTok.utils'])


})();

(function() {
    'use strict'
    angular.module('ngOpenTok.directives.subscriber', ['ngOpenTok.models.subscriber', 'ngOpenTok.utils'])


})();

(function() {
    'use strict'
    angular.module('ngOpenTok.directives.publisher', ['ngOpenTok.models.publisher', 'ngOpenTok.utils'])


})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.publisher', ['ngOpenTok.OTApi', 'ngOpenTok.utils']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.session', ['ngOpenTok.OTApi', 'ngOpenTok.utils', 'ngOpenTok.models.publisher', 'ngOpenTok.models.subscriber']);

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
            return OTAsyncLoader.load()
                .then(function(res) {
                    return res;
                }).catch(function(err) {
                    return $q.reject(err);
                });
        }

        return $q.when($window.OT);
    }


})();

(function() {
    'use strict';
    angular.module('ngOpenTok.loader')
        .provider('OTAsyncLoader', OTAsyncLoaderProvider);

    //Inspired by (ie taken from) angular-google-maps - thanks!

    function OTAsyncLoaderProvider() {
        main.$inject = ["$log", "$window", "rfc4122", "$q", "OPENTOK_URL"];
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
        function main($log, $window, rfc4122, $q, OPENTOK_URL) {
            var scriptId = void 0;
            return {
                load: load
            }

            function isOTLoaded() {
                return angular.isDefined($window.OT);
            }

            function setScript(options, cb) {
                var script, scriptElem;
                if (scriptId) {
                    scriptElem = $window.document.getElementById(scriptId);
                    scriptElem.parentNode.removeChild(scriptElem);
                }
                script = $window.document.createElement('script');
                script.id = scriptId = "opentok_load_" + (rfc4122.v4());
                script.type = 'text/javascript';
                script.onload = function() {
                    cb();
										//untested
                    script.onload = null;
                };
                // TODO IE fix
                // if (script.readyState === 'loaded' || script.readyState === 'completed') {
                //     cb()
                // }
                if (options.transport === 'auto') {
                    script.src = OPENTOK_URL;
                } else {
                    script.src = options.transport + ':' + OPENTOK_URL;
                }
                $window.document.body.appendChild(script);
            }

            function load() {
                var options = that.options,
                    deferred = $q.defer();
                if (isOTLoaded()) {
                    deferred.resolve($window.OT);
                    return deferred.promise;
                }
                var callback = function() {
                    deferred.resolve($window.OT);
                };
                // TODO:  test with mobile
                // if ($window.navigator.connection && $window.Connection && $window.navigator.connection.type === $window.Connection.NONE) {
                //     $window.document.addEventListener('online', function() {
                //         if (!isOTLoaded()) {
                //             return options;
                //         }
                //     });
                // } else {
                setScript(options, callback);
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
    'use strict';

    /** @ngInject */
    capabilitySetterFactory.$inject = ["$q"];
    function capabilitySetterFactory($q) {
        return function(obj) {
            switch (getSum(obj.session.connection.capabilities)) {
                case 1:
                    addSubscribe(obj);
                    break;
                case 2:
                    addPublish(obj);
                    break;
                case 4:
                    addModerate(obj);
                    break;
                default:
                    return standardError('Unrecognized capabilities for connection: ' + obj.session.connection.connectionId);
            }
        };

        function getSum(cap) {
            var sum = 0;
            for (var el in cap) {
                if (angular.isUndefined(el)) {
                    return standardError("Invalid: Capability " + el + " is undefined");
                }
                if (cap.hasOwnProperty(el)) {
                    sum += parseFloat(cap[el]);
                }
            }
            return sum;
        }

        function addSubscribe(obj) {
            angular.extend(obj, {
                subscribe: subscribe,
                unsubscribe: unsubscribe
            });

            function subscribe(s, e, p) {
                return obj.session.subscribe(s, e, p);
            }

            function unsubscribe(s) {
                return obj.session.unsubscribe(s);
            }
        }

        function addPublish(obj) {
            addSubscribe(obj);
            angular.extend(obj, {
                publish: publish,
                unpublish: unpublish
            });

            function publish(p) {
                return obj.session.publish(p);
            }

            function unpublish(p) {
                return obj.session.unpublish(p);
            }
        }

        function addModerate(obj) {
            addPublish(obj)
            angular.extend(obj, {
                forceUnpublish: forceUnpublish,
                forceDisconnect: forceDisconnect
            });

            function forceUnpublish(s) {
                return obj.session.forceUnpublish(s);
            }

            function forceDisconnect(c) {
                return obj.session.forceDisconnect(c);
            }
        }


        function standardError(err) {
            return $q.reject(err);
        }
    }
    angular.module('ngOpenTok.utils')
        .factory('capabilitySetter', capabilitySetterFactory);
})();

(function() {
    'use strict';

    /** @ngInject */
    eventSetterFactory.$inject = ["$q"];
    function eventSetterFactory($q) {
			//TODO check SDK - some events don't return an obj and will fail
			//see otutils
			//this wont work for subscribers bc on,once are cbs

        return function(scope, prop) {
            var types = ['on', 'once'];
            if (!prop || angular.isUndefined(scope[prop])) {
                return standardError('Invalid property: no scope property ' + prop + " found");
            }
            return $q.all(types.map(function(type) {
                var scopeName = type + "Events";
                if (angular.isUndefined(scope[scopeName])) {
                    return
                }
                var keys = Object.keys(scope[scopeName]);
                return $q.all(keys.map(function(key) {
                    return scope[prop][type](key) //TODO no option to pass ctx - :(
                        .then(function(res) {
                            return scope[scopeName][key].apply(null, [scope, res]);
                        }).catch(standardError);
                })).catch(standardError);
            })).catch(standardError);

        }


        function standardError(err) {
            return $q.reject(err);
        }
    }
    angular.module('ngOpenTok.utils')
        .factory('eventSetter', eventSetterFactory);
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

    OpenTokSessionDirective.$inject = ["$q", "$log", "otSessionModel", "eventSetter"];
    angular.module('ngOpenTok.directives.session')
        .directive('opentokSession', OpenTokSessionDirective);

    /** @ngInject */
    function OpenTokSessionDirective($q, $log, otSessionModel, eventSetter) {

        OpenTokSessionController.$inject = ["$scope"];
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                session: '=',
                streams: '=?',
                publishers: '=?',
                onceEvents: '=?',
                onEvents: '=?',
                id: '=?',
                token: '='
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            link: linkFn
        };

        function linkFn(scope) {
            // scope.session = otSessionModel(scope.id)
            if (!scope.publishers) scope.publishers = {};
            if (!scope.streams) scope.streams = {};

            otSessionModel(scope.id)
                .then(function(res) {
                    scope.session = res;
                    scope.session.connect(scope.token)
                }).then(function() {
                    eventSetter(scope, 'session');
                }).catch(standardError);

            scope.$on('$destroy', destroy);

            function destroy() {
                //disconnect

            }
        }

        function standardError(err) {
            return $q.reject(err);
        }

        /** @ngInject */
        function OpenTokSessionController($scope) {
            var vm = this;
            vm.isConnected = isConnected;
            vm.isLocal = isLocal;

            vm.publish = publish;
            vm.unpublish = unpublish;
            vm.subscribe = subscribe;
            vm.unsubscribe = unsubscribe;
            vm.forceDisconnect = forceDisconnect;
            vm.forceUnpublish = forceUnpublish;
            vm.remove = remove;
            vm.signal = signal;


            function getSession() {
                return $scope.session;
            }

            function unpublish(p) {
                return getSession().unpublish(p);
            }

            function unsubscribe(s) {
                return getSession().unsubscribe(s);
            }

            function forceDisconnect(c) {
                return getSession().forceDisconnect(c);
            }

            function forceUnpublish(p) {
                return getSession().forceUnpublish(p);
            }

            function publish(p) {
                return getSession().publish(p)
                    .then(function(res) {
                        $scope.publishers.push(res);
                        return res;
                    }).catch(standardError);
            }


            function remove(type, obj) {
                if (type !== 'publishers') {
                    throw new Error("Invalid type: " + type);
                }
                var arr = $scope[type],
                    idx = arr.indexOf(obj);
                if (idx === -1) {
                    throw new Error("Object: " + obj + " not found");
                }

                arr.splice(idx, 1);
            }

            function signal(data) {
                return getSession().signal(data);
            }

            function subscribe(s, t, p) {
                //should return otsub object
                return getSession().subscribe(s, t, p);
            }

            function getConnection() {
                return getSession().connection
            }

            function isConnected() {
                return angular.isDefined(getConnection())
            }

            function isLocal(str) {
                return getConnection().connectionId === str;
            }
        }


    }

})();

(function() {
    'use strict';

    OpenTokSubscriberDirective.$inject = ["$q", "eventSetter"];
    angular.module('ngOpenTok.directives.subscriber')
        .directive('opentokSubscriber', OpenTokSubscriberDirective);

    /** @ngInject */
    function OpenTokSubscriberDirective($q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                stream: '=',
                onEvents: '=?',
                onceEvents: '=?'
            },
            template: "<div class='opentok-subscriber'></div>",
            link: function(scope, element, a, ctrl) {
                var stream = scope.stream;
                if (ctrl.isConnected()) {
                    scope.subscriber = ctrl.subscribe(stream, element[0]);
                }
                eventSetter(scope, 'subscriber');
                scope.$on('$destroy', destroy);

                function destroy() {
                    ctrl.unsubscribe(stream);
                }

            }
        };

        /** @ngInject */
        // function OpenTokSubscriberController() {
        //     var vm = this;
        //     vm

        // }

    }

})();

(function() {
    'use strict';

    OpenTokPublisherDirective.$inject = ["otPublisherModel", "$q", "eventSetter"];
    angular.module('ngOpenTok.directives.publisher')
        .directive('opentokPublisher', OpenTokPublisherDirective);

    /** @ngInject */
    function OpenTokPublisherDirective(otPublisherModel, $q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                publisher: '=',
                onEvents: '=?',
                onceEvents: '=?'
            },
            template: "<div class='opentok-publisher'></div>",
            link: function(scope, element, a, ctrl) {
                scope.publisher = otPublisherModel.init(element[0]);
                if (ctrl.isConnected()) ctrl.publish(scope.publisher);
                eventSetter(scope, 'publisher');
                scope.$on('$destroy', destroy);

                function destroy() {
                    var str = scope.publisher.stream.connection.connectionId;
                    if (ctrl.isLocal(str)) {
                        ctrl.unpublish(scope.publisher);
                    } else {
                        scope.publisher.destroy();
                        ctrl.remove('publishers', scope.publisher);
                    }
                    //scope.publisher = null - put in session
                }

            }
        };

        /** @ngInject */
        // function OpenTokPublisherController() {
        //     var vm = this;
        //     vm

        // }

    }

})();

// (function() {
//     'use strict';

//     angular.module('ngOpenTok.directives')
//         .factory('otpLinkFn', publisherLinkFn);

//     /** @ngInject */
//     function publisherLinkFn(eventSetter, openTokPublisher) {

//         return function(scope, element, a, ctrl) {
//             var props = scope.props() || {};
//             if (angular.isUndefined(scope.publisher)) scope.publisher = {};
//             scope.publisher = openTokPublisher.init(element[0], props);
//             eventSetter(scope, 'publisher');

//             scope.$on('$destroy', function() {
//                 // if (ctrl) ctrl.unpublish(scope.publisher);
//                 // else scope.publisher.destroy();
//             });

//         };

//     }

// })();

(function() {
    'use strict';

    angular.module('ngOpenTok.models.publisher')
        .provider('otPublisherModel', OpenTokPublisherProvider);

    function OpenTokPublisherProvider() {
        main.$inject = ["$q", "$timeout", "OTApi", "otutil", "$log"];
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
        function main($q, $timeout, OTApi, otutil, $log) {
            var options = pv._options;
            options.targetElement = otutil.paramCheck(options.targetElement, "str", defaultElem);
            options.targetProperties = otutil.paramCheck(options.targetProperties, "obj", defaultProp);

            return {
                init: init,
                getOptions: getOptions
            };


            /**
             * @constructor
             * @param{String} [targetElement] - DOM id of publisher object
             * @param{Object} [props] - properties of publisher object
             * @description params should be defined during config phase
             */

            function init(targetElement, props) {
                return new OpenTokPublisher($q, $timeout, OTApi, otutil, $log, options, targetElement, props);
            }

            /**
             * @summary helper method to share default options with sessionObject
             */

            function getOptions() {
                return {
                    targetElement: options.targetElement,
                    targetProperties: options.targetProperties
                };
            }
        }
    }

    function OpenTokPublisher(q, timeout, api, utils, log, options, targetElement, props) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._options = self._utils.paramCheck(options, "obj", {});
        if (angular.isString(targetElement)) {
            self._targetElement = self._utils.paramCheck(targetElement, "str", self._options.targetElement);
        } else {
            self._targetElement = self._utils.paramCheck(targetElement, "obj", self._options.targetElement);
        }
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
                })).catch(standardError);
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

    OpenTokSessionProvider.$inject = ["otSubscriberModelProvider", "otPublisherModelProvider"];
    angular.module('ngOpenTok.models.session')
        .provider('otSessionModel', OpenTokSessionProvider);

    function OpenTokSessionProvider(otSubscriberModelProvider, otPublisherModelProvider) {
        main.$inject = ["$q", "$timeout", "OTApi", "otutil", "$injector", "otSubscriberModel", "otPublisherModel", "$log"];
        var pv = this;
        pv.$get = main;
        pv._options = {};
        pv.configure = configure;

				/**
				 * @param{Object} opts
				 * @param{Number} opts.apiKey - required
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
        function main($q, $timeout, OTApi, otutil, $injector, otSubscriberModel, otPublisherModel, $log) {
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

                return new OpenTokSession($q, $timeout, OTApi, otutil, $injector, otSubscriberModel, otPublisherModel, $log, paramsOrSessionId, ctx, options);
            }
        }
    }


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
        self._sessionId = self._utils.paramCheck(self._options.session, 'bool', false);
        self._token = self._utils.paramCheck(self._options.token, 'bool', false);

        // if (self._token) {
        //     self._autoConnect = self._utils.paramCheck(self._options.autoConnect, 'bool', true);
        // }

        if (self._sessionId) {
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

                return self;
            }

        }

        function loadAndGetSessionId(args, ctx) {
            return self._q.all([getApi(), getSessionId(args, ctx)]);
        }

        function getSessionId(args, ctx) {
            if (self._sessionId) {
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

                    return self._subscriber;
                }).catch(standardError);
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

        return initSession(self._params, getCTX(self._ctx));

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
          self._log.info(self._session);
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

(function() {
    'use strict';

    angular.module('ngOpenTok.models.subscriber')
        .provider('otSubscriberModel', OpenTokSubscriberProvider);

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
                init: init,
                getOptions: getOptions
            };

            /**
             * @constructor
             * @param{Object} param - subscriber object returned from session.subscribe
             */
            function init(param) {
                return new OpenTokSubscriber($q, otutil, options, param);
            }

            /**
             * @summary helper method to share default options with sessionObject
             */

            function getOptions() {
                return {
                    targetElement: options.targetElement,
                    targetProperties: options.targetProperties
                };
            }
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
