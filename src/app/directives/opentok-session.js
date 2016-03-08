(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('opentokSession', openTokSessionDirective);

    /** @ngInject */
    function openTokSessionDirective($q, openTokSession, capabilitySetter, eventSetter) {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                session: '=',
                // streams: '=',
                // connections: '=',
                onceEvents: '=?',
                onEvents: '=?',
                id: '&?',
                token: '&?'
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            link: linkFn
        };

        function linkFn(scope) {
            scope.session = openTokSession(scope.id)
            scope.session.connect(scope.token)
                .then(function() {
                    eventSetter(scope, 'session');
                    capabilitySetter(scope)
                }).catch(standardError);


            function standardError(err) {
                return $q.reject(err);
            }
        }

        /** @ngInject */
        function OpenTokSessionController($scope) {
            var vm = this;
            vm.isConnected = isConnected;
            vm.isLocal = isLocal;

            // vm.publish = publish;
            // vm.unpublish = unpublish;
            // vm.subscribe = subscribe;
            // vm.unsubscribe = unsubscribe;
            // vm.forceDisconnect = forceDisconnect;
            // vm.forceUnpublish = forceUnpublish;
            vm.signal = signal;


            function getSession() {
                return $scope.session;
            }

            function signal(data) {
                return getSession().signal(data);
            }

            function getConnection() {
                return getSession().connection
            }

            function isConnected() {
                return angular.isDefined(getConnection())
            }

            function isLocal(str) {
                return getConnection().connectionId === str;
            }
        }


    }

})();
