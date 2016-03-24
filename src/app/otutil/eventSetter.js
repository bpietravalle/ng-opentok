(function() {
    'use strict';

    /** @ngInject */
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
