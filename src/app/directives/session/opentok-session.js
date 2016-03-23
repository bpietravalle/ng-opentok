(function() {
    'use strict';

    angular.module('ngOpenTok.directives.session')
        .directive('opentokSession', OpenTokSessionDirective);

    /** @ngInject */
    function OpenTokSessionDirective($q, $log, otSessionModel, eventSetter) {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                sessionId: '@',
                onceEvents: '=?',
                onEvents: '=?',
                token: '@'
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            link: linkFn
        };

        function linkFn(scope) {

            otSessionModel(scope.sessionId, scope.token)
                .then(setSessionAndEvents)
                .then(broadcastReady)
                .catch(standardError);

            function setSessionAndEvents(res) {
                scope.session = res;
                eventSetter(scope, 'session');
            }

            function broadcastReady() {
                scope.$broadcast('sessionReady');
            }

            scope.$on('$destroy', destroy);

            function destroy() {
                //disconnect

            }
        }

        function standardError(err) {
            return $q.reject(err);
        }

        /** @ngInject */
        function OpenTokSessionController($scope) {
            var vm = this;
            vm.isConnected = isConnected;
            vm.isLocal = isLocal;

            vm.addPublisher = addPublisher;
            vm.unpublish = unpublish;
            vm.unsubscribe = unsubscribe;
            vm.forceDisconnect = forceDisconnect;
            vm.forceUnpublish = forceUnpublish;
            vm.signal = signal;


            function getSession() {
                return $scope.session;
            }

            function unpublish(p) {
                return getSession().unpublish(p);
            }

            function unsubscribe(s) {
                return getSession().unsubscribe(s);
            }

            function forceDisconnect(c) {
                return getSession().forceDisconnect(c);
            }

            function forceUnpublish(p) {
                return getSession().forceUnpublish(p);
            }

            function signal(data) {
                return getSession().signal(data);
            }

            // function subscribe(s, t, p) {
            //     return getSession().subscribe(s, t, p);
            // }

            function addPublisher(obj) {
                getSession().publisher = obj;
                if (getSession()._autoPublish) {
                    getSession.publish();
                }
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
