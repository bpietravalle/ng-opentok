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
                publisher: '=',
                onEvents: '=?',
                onceEvents: '=?'
            },
            template: "<div class='opentok-publisher'></div>",
            link: function(scope, element, a, ctrl) {
                scope.publisher = otPublisherModel.init(element[0]);
                eventSetter(scope, 'publisher');
                scope.$on('$destroy', destroy);

                scope.$on('sessionReady', pushPublisher);

                function destroy() {
                    if (scope.publisher.stream) {
                        ctrl.unpublish(scope.publisher);
                    } else {
                        scope.publisher.destroy();
                        ctrl.remove('publishers', scope.publisher);
                    }
                }

                function pushPublisher() {
                    ctrl.addPublisher(scope.publisher);
                }

            }
        };

        /** @ngInject */
        // function OpenTokPublisherController() {
        //     var vm = this;
        //     vm

        // }

    }

})();
