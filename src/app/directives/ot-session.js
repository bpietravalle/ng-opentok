(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('openTokSession', openTokSessionDirective);

    function openTokSessionDirective() {

        return {
            restrict: 'E',
            scope: {
                token: '=',
                sessionId: '=',
                subscribers: '=',
                publishers: '=',
                events: '='
                    // connection: '=',
                    // capabilities: '='
            },
            template: "<div class='opentok-session'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            controllerAs: 'vm',
            bindToController: true
        };

        /** @ngInject */
        function OpenTokSessionController($element) {
            var vm = this;


        }

    }

})();
