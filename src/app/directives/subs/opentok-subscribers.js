(function() {
    'use strict';

    angular.module('ngOpenTok.directives.subscribers')
        .directive('opentokSubscribers', otSubscribersDirective);

    /** @ngInject */
    function otSubscribersDirective($q, $log) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                streams: '=',
                events: '=?'
            },
            template: "<div class='opentok-subscribers'><opentok-subscriber" +
                " ng-repeat='stream in streams track by stream.id' stream='stream' events='events'>" +
                "</opentok-subscriber></div>",
            link: function(scope, element, a, ctrl) {
                scope.$on('sessionReady', getStreams)

                function getStreams() {
                    scope.streams = ctrl.getStreams();
                    $log.info(scope.streams);
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
