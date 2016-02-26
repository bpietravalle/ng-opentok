/**
 * @file angular-uuid-service is a tiny standalone AngularJS UUID/GUID generator service that is RFC4122 version 4 compliant.
 * @author Daniel Lamb <dlamb.open.source@gmail.com>
 */
angular.module('uuid', []).factory('rfc4122', function () {
  function getRandom(max) {
    return Math.random() * max;
  }

  return {
    v4: function () {
      var id = '', i;

      for(i = 0; i < 36; i++)
      {
        if (i === 14) {
          id += '4';
        }
        else if (i === 19) {
          id += '89ab'.charAt(getRandom(4));
        }
        else if(i === 8 || i === 13 || i === 18 || i === 23) {
          id += '-';
        }
        else
        {
          id += '0123456789abcdef'.charAt(getRandom(16));
        }
      }
      return id;
    }
  };
});

(function() {
    'use strict'

    angular.module('ngOpenTok', ['uuid']);

})();

(function() {
    'use strict';

    angular.module('ngOpenTok')
        .constant('OPENTOK_URL', "//static.opentok.com/v2/js/opentok.min.js");
})();

(function() {
    'use strict';
    angular.module('ngOpenTok')
        .config(["$provide", function($provide) {
            $provide.provider('otConfiguration', otConfigurationProvider);
        }]);

    //inspired by angular-google-maps repo...thanks!


    function otConfigurationProvider() {
        otConfigurationGet.$inject = ["rfc4122", "$q", "OPENTOK_URL"];
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
                script.src = options.transport + ':' + OPENTOK_URL;
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
