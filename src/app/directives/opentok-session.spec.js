(function() {
    'use strict';

    describe("otSession Directive", function() {
        var scope, elem, ctrl,vm;

        beforeEach(function() {
            module('ngOpenTok.directives');
            inject(function($compile, $rootScope) {
                scope = $rootScope.$new()
								scope.pcontainer = "heresTheContainer"
                elem = angular.element("<x-opentok-session publisher-id='pcontainer'></x-opentok-session>");
                $compile(elem)(scope);
                scope.$digest();
								ctrl = elem.controller('opentokSession');
								vm = elem.isolateScope();
            });
        });
        afterEach(function() {
            scope = null;
            elem = null;
        });
        it("should compile", function() {
            expect(elem.html()).toBeDefined();
            // expect(elem.html()).toEqual("as");
        });
        it("should have a controller", function() {
						expect(ctrl).toBeDefined();
        });
        it("should be defined", function() {
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
