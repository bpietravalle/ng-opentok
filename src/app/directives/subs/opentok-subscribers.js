(function() {
    'use strict';

    angular.module('ngOpenTok.directives.subscribers')
        .directive('opentokSubscribers', otSubscribersDirective);

    /** @ngInject */
    function otSubscribersDirective($q) {

        return {
            require: '?^^opentokSession',
            restrict: 'E',
            scope: {
                streams: '&',
                events: '=?'
            },
            template: "<div class='opentok-subscribers'><opentok-subscriber" +
                " ng-repeat='stream in streams track by stream.id' stream='stream' events='events'>" +
                "</opentok-subscriber></div>",
            controller: OpenTokSubscribersController,
            controllerAs: 'vm',
            bindToController: true,
            link: function(scope, element, a) {
                // scope.$on('sessionReady', getStreams)

                // function getStreams() {
                //     scope.streams = ctrl.getStreams();
                //     $log.info(scope.streams);
                // }
            }
        };

        /** @ngInject */
        function OpenTokSubscribersController() {
            var vm = this;
            vm

        }

    }

})();
