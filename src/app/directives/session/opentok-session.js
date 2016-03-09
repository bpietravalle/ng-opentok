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
                session: '=',
                onceEvents: '=?',
                onEvents: '=?'
                    // token: '='
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            link: linkFn
        };

        function linkFn(scope) {

            // otSessionModel(scope.id)
            //     .then(function(res) {
            // scope.session.connect(scope.token)
            //     .then(function() {
            eventSetter(scope, 'session');
            scope.$broadcast('sessionReady');
            // }).catch(standardError);

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
            vm.publish = publish;
            vm.unpublish = unpublish;
            vm.subscribe = subscribe;
            vm.unsubscribe = unsubscribe;
            vm.forceDisconnect = forceDisconnect;
            vm.forceUnpublish = forceUnpublish;
            vm.remove = remove;
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

            function publish(p) {
                return getSession().publish(p)
                    .then(function(res) {
                        $scope.publishers.push(res);
                        return res;
                    }).catch(standardError);
            }


            function remove(type, obj) {
                var arr = $scope.session[type],
                    idx = arr.indexOf(obj);
                if (idx !== -1) {
                    arr.splice(idx, 1);
                }
                $log.info("Object: " + obj + " not found in publishers array");
            }

            function signal(data) {
                return getSession().signal(data);
            }

            function subscribe(s, t, p) {
                //should return otsub object
                return getSession().subscribe(s, t, p);
            }

            function addPublisher(obj) {
                getSession().publishers.push(obj);
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
