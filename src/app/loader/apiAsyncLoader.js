(function() {
    'use strict';
    angular.module('ngOpenTok.loader')
        .provider('apiAsyncLoaderOT', apiAsyncLoaderOTProvider);

    function apiAsyncLoaderOTProvider() {
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
        function main($window, $document, rfc4122, $q, OPENTOK_URL) {
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
                script.src = OPENTOK_URL;
                if (options.transport) {
                    script.src = options.transport + ':' + script.src;
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
