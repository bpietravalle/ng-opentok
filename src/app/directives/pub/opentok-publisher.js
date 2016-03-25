(function() {
    'use strict';

    angular.module('ngOpenTok.directives.publisher')
        .directive('opentokPublisher', OpenTokPublisherDirective);

    /** @ngInject */
    function OpenTokPublisherDirective(otPublisherModel, $q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                publisher: '=?',
                events: '=?'
            },
            template: "<div class='opentok-publisher'></div>",
            link: {
                // pre: preLinkFn,
                post: postLinkFn
            }
        };

        // function preLinkFn(scope, element) {
        //     //not sure safe for here
        // }

        function postLinkFn(scope, element, a, ctrl) {
            scope.$on('$destroy', destroy);

            scope.$on('sessionReady', pushPublisher);

            function destroy() {
                // scope.publisher.destroy();
            }

            function pushPublisher() {
                scope.publisher = otPublisherModel.init(element[0]);
                if (scope.events) {
                    eventSetter(scope, 'publisher');
                }
                ctrl.addPublisher(scope.publisher);
            }

        }

        /** @ngInject */
        // function OpenTokPublisherController() {
        //     var vm = this;
        //     vm

        // }

    }

})();
