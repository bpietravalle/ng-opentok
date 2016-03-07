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
