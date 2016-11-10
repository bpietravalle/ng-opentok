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

    angular.module('ngOpenTok.models', ['ngOpenTok.models.streams', 'ngOpenTok.models.subscriber', 'ngOpenTok.models.publisher', 'ngOpenTok.models.session']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.utils', ['ngLodash']);

})();

(function() {
    'use strict'
    angular.module('ngOpenTok.directives.publisher', ['ngOpenTok.models.publisher', 'ngOpenTok.utils'])


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
    angular.module('ngOpenTok.directives.subscribers', ['ngOpenTok.models.subscriber'])


})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.base', ['ngOpenTok.utils']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.connections', ['ngOpenTok.models.base']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.publisher', ['ngOpenTok.OTApi', 'ngOpenTok.utils','ngOpenTok.config']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.session', ['ngOpenTok.models.connections', 'ngOpenTok.models.streams', 'ngOpenTok.OTApi', 'ngOpenTok.utils', 'ngOpenTok.config']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.streams', ['ngOpenTok.models.base']);

})();

(function() {
    'use strict'

    angular.module('ngOpenTok.models.subscriber', ['ngOpenTok.utils','ngOpenTok.config']);

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

    angular.module('ngOpenTok.config', ['ngOpenTok.utils'])
        .provider('otConfiguration', otConfigurationProvider);

    function otConfigurationProvider() {
        main.$inject = ["otutil"];
        var self = this,
            options = {};
        /**
         * autoSubscribe
         * autoPublish
         *
         * @param{Object} opts
         * @param{Object} opts.session - required
         * @param{Number} opts.session.apiKey - required
         * @param{Object} [opts.subscriber] - set default 'targetElement' (ie dom id) and 'targetProperties';
         * @param{Object} [opts.publisher] - set default 'targetElement' (ie dom id) and 'targetProperties';
         * other options see below
         */

        self.getOptions = function() {
            return options;
        };

        //default stream
        self.configure = function(opts) {
            angular.extend(options, opts);
        };

        self.$get = main;

        /** @ngInject */
        function main(otutil) {
            var options = self.getOptions();
            checkConfig(options);

            return {
                getSession: getSession,
                getSubscriber: getSubscriber,
                getPublisher: getPublisher
            }

            function getSession() {
                return options.session;
            }

            function getSubscriber() {
                return options.subscriber;
            }

            function getPublisher() {
                return options.publisher;
            }

            function checkConfig(obj) {

                obj.session = otutil.paramCheck(obj.session, "obj", {});
                obj.subscriber = otutil.paramCheck(obj.subscriber, "obj", {});
                obj.publisher = otutil.paramCheck(obj.publisher, "obj", {});
                if (obj.apiKey) {
                    obj.session.apiKey = obj.apiKey;
                }
                if (!obj.session.apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }
                obj.session.autoPublish = otutil.paramCheck(obj.session.autoPublish, 'bool', true);
                obj.session.autoSubscribe = otutil.paramCheck(obj.session.autoSubscribe, 'bool', true);
                obj.session.events = otutil.paramCheck(obj.session.events, 'bool', false);
                if (obj.session.events) {
                    obj.session.eventsService = otutil.paramCheck(obj.session.eventsService, 'str', "otSessionEvents");
                }
            }

        }

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
    eventSetterFactory.$inject = ["$q"];
    function eventSetterFactory($q) {
        //TODO check SDK - some events don't return an obj and will fail
        //
        //this service wraps the OT callback in a promise and passes
        //scope obj in callback as well - maybe will add ctrl as well;

        return function(scope, prop) {
            var eventsObj, eventTypeGroup, eventNames, registeredEventTypes, validKeys;
            eventsObj = scope.events;
            if (!prop || angular.isUndefined(scope[prop])) {
                return standardError('Invalid property: no scope property ' + prop + " found");
            }
            scope[prop]; // either 'session','subscriber' or 'pbulisher'
            registeredEventTypes = Object.keys(eventsObj);

            return $q.all(registeredEventTypes.map(function(eventType) {
                validKeys = ['on', 'once', 'off'];
                if (validKeys.indexOf(eventType) === -1) {
                    return standardError('Invalid key: ' + eventType + ".  Valid keys are 'on','once',or 'off'");
                }
                eventTypeGroup = eventsObj[eventType];
                eventNames = Object.keys(eventTypeGroup);
                return $q.all(eventNames.map(function(eventName) {
                    return scope[prop][eventType](eventName) //TODO no option to pass ctx - :(
                        .then(function(res) {
                            return scope.events[eventType][eventName].apply(null, [scope, res]);
                        })
                }));
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


    otUtilsFactory.$inject = ["$log", "$q", "lodash"];
    angular.module("ngOpenTok.utils")
        .factory("otutil", otUtilsFactory);


    /** @ngInject */
    function otUtilsFactory($log, $q, lodash) {

        var utils = {
            handler: handler,
            defer: defer,
            extend: extend,
            findIndex: findIndex,
            keys: keys,
            paramCheck: paramCheck,
            qWrap: qWrap,
            qAll: qAll,
            eventHandler: eventHandler,
            standardError: standardError
        };

        return utils;

        function extend(dest, source) {
            return lodash.extend(dest, source);
        }

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

        function findIndex(obj, prop, val) {
            return lodash.findIndex(obj, function(item) {
                return item[prop] === val;
            });
        }

        function invalidType(type) {
            throw new Error("Invalid parameter type at: " + type);
        }

        function hashCheck(hash) {
            //TODO: iterate over keys and check for and remove unknowns
            return hash;
        }

        function keys(obj) {
            return Object.keys(obj);
        }

        function handler(fn, ctx) {
            return utils.defer(function(def) {
                fn.call(ctx, function(err, res) {
                    if (err !== null) {
                        def.reject(err);
                    } else {
                        def.resolve(res);
                    }
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

    OpenTokPublisherDirective.$inject = ["otPublisherModel", "$q", "eventSetter"];
    angular.module('ngOpenTok.directives.publisher')
        .directive('opentokPublisher', OpenTokPublisherDirective);

    /** @ngInject */
    function OpenTokPublisherDirective(otPublisherModel, $q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                publisher: '=?',
                events: '=?'
            },
            template: "<div class='opentok-publisher'></div>",
            link: {
                // pre: preLinkFn,
                post: postLinkFn
            }
        };

        // function preLinkFn(scope, element) {
        //     //not sure safe for here
        // }

        function postLinkFn(scope, element, a, ctrl) {
            scope.$on('$destroy', destroy);

            scope.$on('sessionReady', pushPublisher);

            function destroy() {
                // scope.publisher.destroy();
            }

            function pushPublisher() {
                scope.publisher = otPublisherModel.init(element[0]);
                if (scope.events) {
                    eventSetter(scope, 'publisher');
                }
                ctrl.addPublisher(scope.publisher);
            }

        }

        /** @ngInject */
        // function OpenTokPublisherController() {
        //     var vm = this;
        //     vm

        // }

    }

})();

(function() {
    'use strict';

    OpenTokSessionDirective.$inject = ["$q", "$log", "eventSetter"];
    angular.module('ngOpenTok.directives.session')
        .directive('opentokSession', OpenTokSessionDirective);

    /** @ngInject */
    function OpenTokSessionDirective($q, $log, eventSetter) {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                session: '=',
                streams: '=?',
                events: '=?'
            },
            template: "<div class='opentok-session-container'>" +
                "<ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            bindToController: true,
            controllerAs: 'vm',
            link: {
                pre: preLinkFn,
                post: postLinkFn
            }
        };

        function preLinkFn(scope) {
            scope.streams = scope.vm.getStreams();
        }

        function postLinkFn(scope) {
            scope.$broadcast('sessionReady');
            if (scope.vm.events) {
                eventSetter(scope.vm, 'session'); //put in post link so can pass ctrl as well
            }


            scope.$on('$destroy', destroy);

            function destroy() {
                //disconnect

            }
        }

        // function standardError(err) {
        //     return $q.reject(err);
        // }

        function OpenTokSessionController() {

            var vm = this;
            vm.isConnected = isConnected;
            vm.isLocal = isLocal;
            vm.autoSubscribe = autoSubscribe;
            vm.getStreams = getStreams;

            vm.addPublisher = addPublisher;
            vm.unpublish = unpublish;
            vm.publish = publish;
            vm.subscribe = subscribe;
            vm.unsubscribe = unsubscribe;
            vm.forceDisconnect = forceDisconnect;
            vm.forceUnpublish = forceUnpublish;
            vm.signal = signal;


            function getSession() {
                return vm.session;
            }

            function autoSubscribe() {
                return getSession().autoSubscribe
            }

            function getStreams() {
                return getSession().getStreams();
            }

            function publish(p) {
                return getSession().publish(p);
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

            function signal(data) {
                return getSession().signal(data);
            }

            function subscribe(s, t, p) {
                return getSession().subscribe(s, t, p);
            }

            function addPublisher(obj) {
                getSession().setPublisher(obj)

                if (getSession().autoPublish) {
                    // $log.info('publisher added')
                    // publish(obj);
                }
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

    otSubscriberDirective.$inject = ["$q", "eventSetter", "$log"];
    angular.module('ngOpenTok.directives.subscriber')
        .directive('opentokSubscriber', otSubscriberDirective);

    /** @ngInject */
    function otSubscriberDirective($q, eventSetter, $log) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                stream: '=',
                subscriber: '=?',
                events: '=?'
            },
            template: "<div class='opentok-subscriber'></div>",
            link: function(scope, element, a, ctrl) {

                ctrl.subscribe(scope.stream, element[0])
                    .then(function(res) {
                        scope.subscriber = res;
                        scope.subscriber.element.style.height = '750px';
                    });
                if (scope.events) {
                    eventSetter(scope, 'subscriber');
                }

                $log.info("We streamin");
                // }

                scope.$on('$destroy', destroy);

                function destroy() {
                    ctrl.unsubscribe(scope.stream);
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

    otSubscribersDirective.$inject = ["$q", "$log"];
    angular.module('ngOpenTok.directives.subscribers')
        .directive('opentokSubscribers', otSubscribersDirective);

    /** @ngInject */
    function otSubscribersDirective($q, $log) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            transclude: true,
            scope: {
                streams: '=streams',
                events: '=?'
            },
            template: "<div class='opentok-subscribers'><opentok-subscriber" +
                " ng-repeat='stream in streams track by stream.id' stream='stream' events='events'>" +
                "<ng-transclude></ng-transclude></opentok-subscriber></div>",
            // controller: OpenTokSubscribersController,
						// controllerAs: 'vm',
            // bindToController: true,
            link: {
                pre: prelink,
                post: postlink
            }

        };

        function prelink(scope) {
            $log.info('in subscribers pre')
            $log.info(scope)
        }

        function postlink(scope, element, a, ctrl) {
            $log.info('in subscribers')
            $log.info(scope);

            scope.$on('sessionReady', getStreams)

            function getStreams() {
                scope.streams = ctrl.getStreams();
                $log.info(scope.streams);
            }
        }
    }

    /** @ngInject */
    // function OpenTokSubscribersController($log) {
    //     var vm = this;
    //     $log.info('in subscribers')
    //     $log.info(vm)

    // }


})();

(function() {
    'use strict';

    /** @ngInject */
    otParentFactory.$inject = ["$q", "$timeout", "otutil"];
    function otParentFactory($q, $timeout, otutil) {

        return function(options) {
            return new ParentModel($q, $timeout, otutil, options)
        };
    }

    function ParentModel(q, timeout, utils, options) {
        var children = {},
            self = this;
        self._q = q;
        self._timeout = timeout;
        self._utils = utils;
        self._options = options || {};
        self._childKey = self._utils.paramCheck(self._options.id, "str", "id");
        self._manager = self._utils.paramCheck(self._options.manager, "str", "manager");
        self.getAll = function() {
            return children;
        };

    }

    ParentModel.prototype.extend = extend;
    ParentModel.prototype.keys = keys;
    ParentModel.prototype.getRecord = getRecord;
    ParentModel.prototype.add = add;
    ParentModel.prototype.remove = remove;
    ParentModel.prototype.addManager = addManager;

    function getRecord(key) {
        var self = this;
        key = checkKey(key, self._childKey);
        return self.getAll()[key];
    }

    function addManager(id, obj) {
        var self = this,
            rec = self.getRecord(id);
        rec[self._manager] = obj;
    }

    function keys() {
        var self = this;
        return self._utils.keys(self.getAll());
    }


    function remove(key) {
        var self = this;
        self._timeout(function() {
            key = checkKey(key, self._childKey);
            delete self.getAll()[key];
        });
    }

    function add(obj) {
        var self = this,
            id = obj[self._childKey],
            newObj = {};
        self._timeout(function() {
            if (angular.isUndefined(id)) {
                throw new Error("No " + self._childKey + " property found for: " + id);
            }
            newObj[id] = {
                main: obj
            }
            angular.extend(self.getAll(), newObj);
        });
    }

    function extend(obj) {
        var self = this;
        return self._utils.extend(obj, self);
    }

    function checkKey(str, def) {
        switch (angular.isString(str)) {
            case true:
                return str;
            default:
                switch (angular.isObject(str)) {
                    case true:
                        if (angular.isDefined(str[def])) {
                            return str[def];
                        }
                        if (angular.isDefined(str['main'][def])) {
                            return str['main'][def];
                        }
                        break;
                    default:
                        throw new Error("No record found for key: " + str);
                }
        }
    }


    angular.module('ngOpenTok.models.base')
        .factory('otParent', otParentFactory);

})();

(function() {
    'use strict';

    /** @ngInject */
    otConnectionsFactory.$inject = ["otParent"];
    function otConnectionsFactory(otParent) {

        return function() {
            return new ConnectionsModel(otParent)
        };
    }

    function ConnectionsModel(base) {
        var self = this;
        return base({
            id: 'connectionId'
        }).extend(self);
    }

    ConnectionsModel.prototype.getConnection = getConnection;

    function getConnection(key) {
        var self = this,
            rec = self.getRecord(key);
        return rec.main;
    }

    angular.module('ngOpenTok.models.connections')
        .factory('otConnections', otConnectionsFactory);

})();

(function() {
    'use strict';

    otPublisherModelFactory.$inject = ["$q", "$timeout", "OTApi", "otutil", "$log", "otConfiguration"];
    angular.module('ngOpenTok.models.publisher')
        .factory('otPublisherModel', otPublisherModelFactory);

    /** @ngInject */
    function otPublisherModelFactory($q, $timeout, OTApi, otutil, $log, otConfiguration) {

        return {
            init: init
        };

        /**
         * @constructor
         * @param{String|Object} [targetElement] - DOM id  or element for publisher
         * @param{Object} [props] - properties of publisher object
         * @description params should be defined during config phase
         */

        function init(targetElement, props) {
            return new OpenTokPublisher($q, $timeout, OTApi, otutil, $log, otConfiguration, targetElement, props);
        }

    }

    function OpenTokPublisher(q, timeout, api, utils, log, config, targetElement, props) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._options = config.getPublisher();
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
        if (!ctx) ctx = publisher;
        return this._utils.eventHandler(function(cb) {
            return publisher.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var publisher = this._publisher;
        if (!ctx) ctx = publisher;
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

// (function() {
//     'use strict';

//     /** @ngInject */
//     function defaultEventsFactory($timeout) {
//         return function() {
//             var self = this;
//             self.on({
//                 'sessionDisconnected': function() {
//                     $timeout(function() {
//                         self.streams = {};
//                         self.connections = {};
//                     });
//                 },
//                 'streamDestroyed': function(event) {
//                     $timeout(function() {
//                         self.streams.remove(event.stream);
//                     });
//                 },
//                 'streamCreated': function(event) {
//                     $timeout(function() {
//                         self.streams.add(event.stream);
//                     });
//                 },
//                 'connectionCreated': function(event) {
//                     $timeout(function() {
//                         self.connections.add(event.connection);
//                     });
//                 },
//                 'connectionDestroyed': function(event) {
//                     $timeout(function() {
//                         self.connections.remove(event.connection);
//                     });
//                 }
//             })
//         }
//     }

//     angular.module('ngOpenTok.models.session')
//         .factory('defaultEvents', defaultEventsFactory)
// })();

(function() {
    'use strict';

    otSessionModelFactory.$inject = ["$q", "$timeout", "$injector", "OTApi", "otutil", "$log", "otConfiguration", "otStreams", "otConnections"];
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


    OpenTokSession.prototype.removeStream = removeStream;
    OpenTokSession.prototype.addStream = addStream;
    OpenTokSession.prototype.setPublisher = setPublisher;
    OpenTokSession.prototype.subscribe = subscribe;
    OpenTokSession.prototype.publish = publish;
    OpenTokSession.prototype.signal = signal;
    OpenTokSession.prototype.getStreams = getStreams;
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
          self._log.info(self.publisher);
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

    function getStreams() {
        var self = this;
        return self.streams.getAll();
    }


    function addStream(obj) {
        this.streams.add(obj);
    }

    function removeStream(obj) {
        this.streams.remove(obj);
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
                session.forceUnpublish(stream.main, cb);
            })
            .catch(function(err) {
                return self._utils.standardError(err);
            });
    }

    function forceDisconnect(connection) {
        var self = this;
        var session = this._session;
        return this._utils.handler(function(cb) {
                session.forceDisconnect(connection.main, cb);
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

(function() {
    'use strict';

    /** @ngInject */
    otStreamsFactory.$inject = ["$q", "otParent"];
    function otStreamsFactory($q, otParent) {

        return function() {
            return new StreamsModel(otParent)
        };
    }

    function StreamsModel(base) {
        var self = this;
        return base({
            id: 'streamId',
            manager: 'subscriber'
        }).extend(self);
    }

    StreamsModel.prototype.getSubscriber = getSubscriber;
    StreamsModel.prototype.getStream = getStream;

    function getSubscriber(key) {
        var self = this,
            rec = self.getRecord(key);
        return rec.subscriber;
    }

    function getStream(key) {
        var self = this,
            rec = self.getRecord(key);
        return rec.main;
    }

    angular.module('ngOpenTok.models.streams')
        .factory('otStreams', otStreamsFactory);

})();

(function() {
    'use strict';

    otSubscriberModelFactory.$inject = ["$q", "otutil", "otConfiguration"];
    angular.module('ngOpenTok.models.subscriber')
        .factory('otSubscriberModel', otSubscriberModelFactory);

    /** @ngInject */
    function otSubscriberModelFactory($q, otutil, otConfiguration) {

        return {
            init: init
        };

        /**
         * @constructor
         * @param{Object} param - subscriber object returned from session.subscribe
         */

        function init(param) {
            return new OpenTokSubscriber($q, otutil, otConfiguration, param);
        }

    }


    function OpenTokSubscriber(q, utils, config, param) {
        var self = this;
        self._q = q;
        self._utils = utils;
        self._options = config.getSubscriber();
        self._param = param;


        function initSubscriber(obj) {
            var methodsToExtend = ['on', 'once', 'getStats'];
            self._subscriber = obj;
            var keys = Object.keys(self._subscriber);
            return self._q.all(keys.map(function(key) {
                if (methodsToExtend.indexOf(key) === -1) {
                    self[key] = self._subscriber[key];
                }
            })).then(function() {
                return self;
            }).catch(standardError);
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }

        return initSubscriber(self._param);

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
        if (!ctx) ctx = subscriber;
        return this._utils.eventHandler(function(cb) {
            return subscriber.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var subscriber = this._subscriber;
        if (!ctx) ctx = subscriber;
        return this._utils.eventHandler(function(cb) {
            return subscriber.once(eventName, cb);
        }, ctx);
    }

    function getStats(ctx) {
        var subscriber = this._subscriber;
        if (!ctx) ctx = subscriber;
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
