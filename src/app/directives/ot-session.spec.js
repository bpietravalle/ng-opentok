(function() {
    'use strict';

    describe("otSession Directive", function() {
        var scope, elem;

        beforeEach(function() {
            module('ngOpenTok.directives');
            inject(function($compile, $rootScope) {
                scope = $rootScope.$new()
                scope.mySubscribers = [];
                scope.myPublishers = [];
                scope.otToken = "myToken";
                scope.otSessionId = "mySessionId";
                elem = angular.element("<opentok-session token='otToken' session-id='otSessionId'" +
                    "subscribers='mySubscribers' publishers='myPublishers'></opentok-session>");
                $compile(elem)(scope);
                scope.$digest();
            });
        });
        afterEach(function() {
            scope = null;
            elem = null;
        });
        // it("should be defined", function() {
        //     expect(test).toEqual("myToken");
        // });
        // describe("Properties", function() {
        //     describe("SessionId", function() {
        //         it("should work", function() {
        //             expect(elem.html()).toBeDefined();
        //         });
        //     });
        // });
    });
})();
