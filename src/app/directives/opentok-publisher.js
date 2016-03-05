(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('opentokPublisher', openTokPublisherDirective);

    function openTokPublisherDirective() {

        return {
            restrict: 'E',
            scope: {
                token: '=',
                events: '=',
                targetElementId: '=',
                targetProperties: '='
            },
            template: "<div x-opentok-publisher></div>",
            controller: OpenTokPublisherController,
            controllerAs: 'vm',
            bindToController: true,
            link: function(scope) {
                scope
            }
        };

        /** @ngInject */
        function OpenTokPublisherController() {
            var vm = this;
            vm

        }

    }

})();
