(function() {
    'use strict';

    /** @ngInject */
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
