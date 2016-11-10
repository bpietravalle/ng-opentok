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
