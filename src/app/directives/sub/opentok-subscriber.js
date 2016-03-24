(function() {
    'use strict';

    angular.module('ngOpenTok.directives.subscriber')
        .directive('opentokSubscriber', otSubscriberDirective);

    /** @ngInject */
    function otSubscriberDirective($q, eventSetter, $log) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                stream: '=',
                events: '=?'
            },
            template: "<div class='opentok-subscriber'></div>",
            link: function(scope, element, a, ctrl) {
                var stream = scope.stream;
                scope.$on('sessionReady', subscribe)

                function subscribe() {
                    scope.subscriber = ctrl.subscribe(stream, element[0]);
                    if (scope.events) {
                        eventSetter(scope, 'subscriber');
                    }
                    $log.info("We streamin");
                    $log.info(scope.subscriber);
                }

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
