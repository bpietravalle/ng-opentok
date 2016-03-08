(function() {
    'use strict';

    angular.module('ngOpenTok.directives.publisher', ['ngOpenTok.models.publisher', 'ngOpenTok.utils'])
        .directive('opentokPublisher', openTokPublisherDirective);

    /** @ngInject */
    function openTokPublisherDirective(openTokPublisher, $q, eventSetter) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                publisher: '=',
                onEvents: '=?',
                onceEvents: '=?',
                props: '&'
            },
            template: "<div class='opentok-publisher'></div>",
            link: function(scope, element, a, ctrl) {
                var props = scope.props() || {};
                scope.publisher = openTokPublisher.init(element[0], props);
                eventSetter(scope, 'publisher');
                scope.$on('$destroy', destroy);

                function destroy() {
                    var str = scope.publisher.stream.connection.connectionId;
                    if (ctrl.isLocal(str)) {
                        ctrl.unpublish(scope.publisher);
                    } else {
                        scope.publisher.destroy();
                        ctrl.remove('publishers', scope.publisher);
                    }
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
