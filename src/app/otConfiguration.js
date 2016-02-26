(function() {
    'use strict';
    angular.module('ngOpenTok')
        .config(function($provide) {
            $provide.provider('otConfiguration', otConfigurationProvider);
        });

    function otConfigurationProvider() {
        var that = this;
        that.options = {
            transport: 'https',
            preventLoad: false
        };
        that.configure = configure;


        that.params = {};
        that.setApiKey = setApiKey;
        that.setParams = setParams;

        function configure(options) {
            angular.extend(that.options, options);
        };

        function setApiKey(str) {
            angular.extend(that.params, {
                apiKey: str
            });
        }

        function setParams(key, val) {
            that.params[key] = val;
        }

        that.$get = otConfigurationGet;

        /** @ngInject */
        function otConfigurationGet(rfc4122, $q, OPENTOK_URL) {
            var scriptId, usedConfiguration;
            usedConfiguration = void 0;
            scriptId = void 0;

            if (angular.isUndefined(that.params.apiKey)) {
                return $q.reject("You must set an ApiKey during the config phase of your module");
            }
            return {

                load: load,
                getParams: getParams
            }

            function getParams() {
                return that.params;
            }

            function isOTLoaded() {
                return angular.isDefined(window.OT);
            }

            function setScript(options) {
                var script, scriptElem;
                if (scriptId) {
                    scriptElem = document.getElementById(scriptId);
                    scriptElem.parentNode.removeChild(scriptElem);
                }
                script = document.createElement('script');
                script.id = scriptId = "opentok_load_" + (rfc4122.v4());
                script.type = 'text/javascript';
                script.src = OPENTOK_URL;
                if (options.transport) {
                    script.src = options.transport + ':' + script.src;
                }

                return document.body.appendChild(script);
            }



            function load() {
                var options = that.options;
                var deferred, randomizedFunctionName;
                deferred = $q.defer();
                if (isOTLoaded()) {
                    deferred.resolve(window.OT);
                    return deferred.promise;
                }
                randomizedFunctionName = options.callback = 'onOpenTokReady' + Math.round(Math.random() * 1000);
                window[randomizedFunctionName] = function() {
                    window[randomizedFunctionName] = null;
                    deferred.resolve(window.OT);
                };
                // if (window.navigator.connection && window.Connection && window.navigator.connection.type === window.Connection.NONE) {
                //     document.addEventListener('online', function() {
                //         if (!isOTLoaded()) {
                //             return setScript(options);
                //         }
                //     });
                // } else 
                // if (!options.preventLoad) {
                setScript(options);
                // }
                usedConfiguration = options;
                usedConfiguration.randomizedFunctionName = randomizedFunctionName;
                return deferred.promise;
            }
        }
    }

}.call(this));
