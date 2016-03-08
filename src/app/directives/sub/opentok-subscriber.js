(function() {
    'use strict';

    angular.module('ngOpenTok.directives.subscriber', ['ngOpenTok.models.subscriber', 'ngOpenTok.utils'])
        .directive('opentokSubscriber', openTokSubscriberDirective);

    /** @ngInject */
    function openTokSubscriberDirective($q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                stream: '=',
                onEvents: '=?',
                onceEvents: '=?',
                props: '&'
            },
            template: "<div class='opentok-subscriber'></div>",
            link: function(scope, element, a, ctrl) {
                var stream = scope.stream;
                var props = scope.props() || {};
                scope.subscriber = ctrl.subscribe(stream, element[0], props);
                //have to extend on,once
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
