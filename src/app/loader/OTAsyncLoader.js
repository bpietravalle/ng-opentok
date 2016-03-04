(function() {
    'use strict';
    angular.module('ngOpenTok.loader')
        .provider('OTAsyncLoader', OTAsyncLoaderProvider);

    //Inspired by (ie taken from) angular-google-maps - thanks!

    function OTAsyncLoaderProvider() {
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
            // usedConfiguration = void 0,

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
                //TODO add IE-support
                script.onload = function() {
                    cb();
                };
                if (options.transport === 'auto') {
                    script.src = OPENTOK_URL;
                } else {
                    script.src = options.transport + ':' + OPENTOK_URL;
                }

                // script.src = script.src + '?callback=' + options.callback;
                $window.document.body.appendChild(script);
            }

            function load() {
                var options = that.options,
                    deferred = $q.defer();
                // randomizedFunctionName;
                if (isOTLoaded()) {
                    deferred.resolve($window.OT);
                    return deferred.promise;
                }
                // randomizedFunctionName = options.callback = 'onOpenTokReady' + Math.round(Math.random() * 1000);
                var callback = function() {
                    // $window[randomizedFunctionName] = null;
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
                // usedConfiguration = options;
                // usedConfiguration.randomizedFunctionName = randomizedFunctionName;
                return deferred.promise;
            }
        }
    }

}.call(this));
