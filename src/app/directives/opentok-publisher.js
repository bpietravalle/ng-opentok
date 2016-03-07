(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
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
            link: function(scope, element) {
                var props = scope.props() || {};
                if (angular.isUndefined(scope.publisher)) scope.publisher = {};
                scope.publisher = openTokPublisher.init(element[0], props);
                eventSetter(scope, 'publisher');
            }
        };

        /** @ngInject */
        function OpenTokPublisherController() {
            var vm = this;
            vm

        }

    }

})();
