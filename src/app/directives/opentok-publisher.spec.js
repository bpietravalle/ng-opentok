(function() {
    'use strict';

    describe("otPublisher Directive", function() {
        var scope, ctrl, elem;

        beforeEach(function() {
            module('ngOpenTok.directives');
            inject(function($compile, $rootScope) {
                scope = $rootScope.$new()
                scope.otToken = "myToken";
                scope.properties = {};
                scope.otPublisherId = "myPublisherId";
                elem = angular.element("<x-opentok-publisher token='otToken' target-element-id='otPublisherId'" +
                    "target-properties='properties'></x-opentok-publisher>");

                $compile(elem)(scope);
                scope.$digest();
                ctrl = elem.controller('opentokPublisher');
            });
        });
        afterEach(function() {
            scope = null;
            elem = null;
        });
        it("should be defined", function() {
            expect(ctrl).toBeDefined();
            expect(elem.isolateScope()).toBeDefined();
            // expect(elem.find('div').text()).toEqual("as");
            // expect(doc.find('targetElementId')).toEqual("as");
        });
        it("should compile correctly", function() {
            expect(elem.html()).toBeDefined();
        });

        // describe("Properties", function() {
        //     describe("PublisherId", function() {
        //         it("should work", function() {
        //             expect(elem.html()).toBeDefined();
        //         });
        //     });
        // });
    });
})();
