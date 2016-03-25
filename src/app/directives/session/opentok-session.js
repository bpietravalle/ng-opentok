(function() {
    'use strict';

    angular.module('ngOpenTok.directives.session')
        .directive('opentokSession', OpenTokSessionDirective);

    /** @ngInject */
    function OpenTokSessionDirective($q, $log, eventSetter) {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                session: '=',
                events: '=?'
            },
            template: "<div class='opentok-session-container'><ng-transclude></ng-transclude></div>",
            controller: OpenTokSessionController,
            bindToController: true,
            controllerAs: 'vm',
            link: {
                // pre: preLinkFn,
                post: postLinkFn
            }
        };

        // function preLinkFn(scope) {
        //     // var session = scope.vm.session;
        //     // $log.info(session.on);
        //     // if (session.sessionEvents) {
        //     //     session.setSessionEvents()
        //     // }
        //     // if (session.autoConnect) {
        //     //     session.connect();
        //     // }
        //     // scope.$watch('vm.session', function(n, o) {
        //     //     n.connect();
        //     //     $log.info(n);
        //     // });

        // }

        function postLinkFn(scope) {
            if (scope.vm.events) {
                eventSetter(scope.vm, 'session'); //put in post link so can pass ctrl as well
            }


            scope.$on('$destroy', destroy);
            scope.$broadcast('sessionReady');

            function destroy() {
                //disconnect

            }
        }

        // function standardError(err) {
        //     return $q.reject(err);
        // }

        function OpenTokSessionController() {

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

            // init();

            // function init() {
            //     return otSessionModel({
            //             sessionId: vm.auth.sessionId,
            //             token: vm.auth.token
            //         })
            //         .then(setSessionAndEvents)
            //         .catch(standardError);

            //     function setSessionAndEvents(res) {
            //         vm.session = res;
            //         vm.streams = vm.session.streams;
            //         vm.publisher = vm.session.publisher;
            //         vm.connections = vm.session.connections;
            //     }

            // }

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
                getSession().setPublisher(obj)

                if (getSession().autoPublish) {
                    $log.info('publisher added')
                        // publish(obj);
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
