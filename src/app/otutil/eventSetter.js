(function() {
    'use strict';

    /** @ngInject */
    function eventSetterFactory($q) {
			//TODO check SDK - some events don't return an obj and will fail
			//see otutils

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
