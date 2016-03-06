(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('opentokSession', openTokSessionDirective);

    function openTokSessionDirective() {

        return {
            restrict: 'E',
            scope: {
                session: '=',
                streams: '=',
                connections: '=',
                onceEvents: '=?',
                onEvents: '=?',
                id: '&?',
                token: '&?'

            },
            template: "<div class='opentok-session-container'></div>",
            controller: OpenTokSessionController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* principles: session obj should be initialized before directive
         * token: should be available sessionId doesn't need to be
         * ngOpenTok-Session should have method to retrieve token and method for init - like publishers/subscribers
         * probably don't need pub and sub services?
         * how handle streams and connections
         *
         */


        /** @ngInject */
        function OpenTokSessionController($q, openTokSession) {
            var vm = this;

            function init() {
                vm.session = openTokSession(vm.id)
                return vm.session.connect(vm.token)
                    .then(addEvents)
                    .catch(standardError);

            }

            function addEvents() {
                var types = ['on', 'once'];
                return $q.all(types.map(function(type) {
                    var scopeName = type + "Events";
                    var keys = Object.keys(vm[scopeName]);
                    $q.all(keys.map(function(key) {
                        vm.session[type](key, vm[scopeName][key], vm) //using vm as ctx for meow
                    })).catch(standardError);
                })).catch(standardError);
            }

            init();

            function standardError(err) {
                return $q.reject(err);
            }


        }

    }

})();
