(function() {
    'use strict';

    describe("otSession Directive", function() {
        var scope, elem;

        beforeEach(function() {
            module('ngOpenTok.directives');
            inject(function($compile, $rootScope) {
                scope = $rootScope.$new()
								scope.subscribers = ["asas","sdsdc"];
                scope.sessionId = "Boom!!";
                elem = angular.element("<x-opentok-session id='sessionId'>''</x-opentok-session>");
                $compile(elem)(scope);
                scope.$digest();
            });
        });
        afterEach(function() {
            scope = null;
            elem = null;
        });
        it("should be defined", function() {
            // expect(elem.html()).toEqual("as");
        });
        // describe("Properties", function() {
        //     describe("SessionId", function() {
        //         it("should work", function() {
        //             expect(elem.html()).toBeDefined();
        //         });
        //     });
        // });
    });
})();
