(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('opentokSession', openTokSessionDirective);

    function openTokSessionDirective() {

        return {
            restrict: 'E',
            scope: {
                publisherId: '='
            },
            link: function(scope, el, attrs) {
            },
            template: "<div id='publisherId'></div>",
            controller: OpenTokSessionController,
            controllerAs: 'vm',
            bindToController: true
        };

        /** @ngInject */
        function OpenTokSessionController() {
            var vm = this;
						vm


        }

    }

})();
