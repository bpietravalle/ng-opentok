(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('opentokSession', openTokSessionDirective);

    /** @ngInject */
    function openTokSessionDirective($q, openTokSession, eventSetter) {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                session: '=',
                streams: '=',
                connections: '=',
                onceEvents: '=?',
                onEvents: '=?',
                id: '&?',
                token: '&?'
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            link: function(scope) {
                scope.session = openTokSession(scope.id)
                scope.session.connect(scope.token)
                    .then(function() {
                        eventSetter(scope, 'session');
                    }).catch(standardError);
            }
        };

        function standardError(err) {
            return $q.reject(err);
        }

        /** @ngInject */
        function OpenTokSessionController($scope) {
            var vm = this;
            vm.getSession = getSession;

            function getSession() {
                return $scope.session;
            }

            /*
             * get session;
             * set session;
             *
             */

        }


    }

})();
