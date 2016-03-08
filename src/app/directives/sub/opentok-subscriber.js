(function() {
    'use strict';

    angular.module('ngOpenTok.directives.subscriber')
        .directive('opentokSubscriber', OpenTokSubscriberDirective);

    /** @ngInject */
    function OpenTokSubscriberDirective($q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                stream: '=',
                onEvents: '=?',
                onceEvents: '=?'
            },
            template: "<div class='opentok-subscriber'></div>",
            link: function(scope, element, a, ctrl) {
                var stream = scope.stream;
                // if (ctrl.isConnected()) {
                scope.subscriber = ctrl.subscribe(stream, element[0]);
                // }
                eventSetter(scope, 'subscriber');
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
