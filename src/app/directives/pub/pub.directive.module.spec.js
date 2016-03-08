(function() {
    'use strict'

    describe("ngOpenTok.directives.publisher Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.directives.publisher');
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
                deps = module.value('ngOpenTok.directives.publisher').requires;
            });
            it("should depend on ngOpenTok.models.publisher", function() {
                expect(hasModule("ngOpenTok.models.publisher")).toBeTruthy();
            });
            it("should depend on ngOpenTok.utils", function() {
                expect(hasModule("ngOpenTok.utils")).toBeTruthy();
            });
        });

    });


})();
