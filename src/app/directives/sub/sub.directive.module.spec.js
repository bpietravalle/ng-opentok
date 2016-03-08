(function() {
    'use strict'

    describe("ngOpenTok.directives.subscriber Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.directives.subscriber');
        });

        it("should be defined", function() {
            expect(module).toBeDefined();
        });
        describe("Dependencies:", function() {
            var deps;
            var hasModule = function(m) {
                return deps.indexOf(m) >= 0;
            };
            beforeEach(function() {
                deps = module.value('ngOpenTok.directives.subscriber').requires;
            });
            it("should depend on ngOpenTok.models.subscriber", function() {
                expect(hasModule("ngOpenTok.models.subscriber")).toBeTruthy();
            });
            it("should depend on ngOpenTok.utils", function() {
                expect(hasModule("ngOpenTok.utils")).toBeTruthy();
            });
        });

    });


})();
