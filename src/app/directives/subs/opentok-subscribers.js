(function() {
    'use strict';

    angular.module('ngOpenTok.directives.subscribers')
        .directive('opentokSubscribers', otSubscribersDirective);

    /** @ngInject */
    function otSubscribersDirective($q, $log) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            // transclude: true,
            scope: {
                streams: '=streams',
                events: '=?'
            },
            template: "<div class='opentok-subscribers'><opentok-subscriber" +
                " ng-repeat='stream in streams track by stream.id' stream='stream' events='events'>" +
                "<ng-transclude></ng-transclude></opentok-subscriber></div>",
            controller: OpenTokSubscribersController,
            bindToController: true,
            link: {
                pre: prelink,
                post: postlink
            }

        };

        function prelink(scope) {
            $log.info('in subscribers pre')
            $log.info(scope)
        }

        function postlink(scope, element, a, ctrl) {
            $log.info('in subscribers')
            $log.info(scope);

            scope.$on('sessionReady', getStreams)

            function getStreams() {
                scope.streams = ctrl.getStreams();
                $log.info(scope.streams);
            }
        }
    }

    /** @ngInject */
    function OpenTokSubscribersController($log) {
        var vm = this;
        $log.info('in subscribers')
        $log.info(vm)

    }


})();
