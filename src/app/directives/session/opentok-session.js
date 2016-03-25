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
                session: '=?',
                auth: '=',
                events: '=?'
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
						controllerAs: 'vm',
            link: {
                post: postLinkFn
            }
        };


        function postLinkFn(scope) {
            if (scope.events) {
                eventSetter(scope, 'session'); //put in post link so can pass ctrl as well
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
        function OpenTokSessionController($log, $scope, otSessionModel) {
            var vm = this;
            vm.isConnected = isConnected;
            vm.isLocal = isLocal;
            vm.autoSubscribe = autoSubscribe;
            vm.getStreams = getStreams;

            vm.addPublisher = addPublisher;
            vm.unpublish = unpublish;
            vm.publish = publish;
            vm.subscribe = subscribe;
            vm.unsubscribe = unsubscribe;
            vm.forceDisconnect = forceDisconnect;
            vm.forceUnpublish = forceUnpublish;
            vm.signal = signal;

            init();

            function init() {
                return otSessionModel({
                        sessionId: $scope.auth.sessionId,
                        token: $scope.auth.token
                    })
                    .then(setSessionAndEvents)
                    .catch(standardError);

                function setSessionAndEvents(res) {
                    vm.session = res;
                    vm.streams = vm.session.streams;
                    vm.publisher = vm.session.publisher;
                    vm.connections = vm.session.connections;
                    $scope.$broadcast('sessionReady');
                }

            }

            function getSession() {
                return vm.session;
            }

            function autoSubscribe() {
                return getSession().autoSubscribe
            }

            function getStreams() {
                return getSession().streams;
            }

            function publish(p) {
                return getSession().publish(p);
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

            function subscribe(s, t, p) {
                return getSession().subscribe(s, t, p);
            }

            function addPublisher(obj) {
                getSession().publisher = obj
                if (getSession().autoPublish) {
                    publish(obj);
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
