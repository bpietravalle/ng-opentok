(function() {
    'use strict';

    describe("otSession Directive", function() {
        var scope, elem;

        beforeEach(function() {
            module('ngOpenTok');
            inject(function($compile, $rootScope) {
                scope = $rootScope.$new()
                scope.sessionId = "Boom!!";
                elem = angular.element("<ot-session ></ot-session>");
                $compile(elem)(scope);
                scope.$digest();
            });
        });
				afterEach(function(){
					scope = null;
					elem = null;
				});
        it("should be defined", function() {
            expect(elem.html()).toBeDefined();
        });
        describe("Properties", function() {
            describe("SessionId", function() {
                it("should work", function() {
                    expect(elem.html()).toBeDefined();
                });
            });
        });
    });
})();
