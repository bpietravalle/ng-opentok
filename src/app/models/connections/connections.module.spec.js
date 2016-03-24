(function() {
    'use strict'

    describe("ngOpenTok.models.connections Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.models.connections');
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
                deps = module.value('ngOpenTok.models.connections').requires;
            });
            it("should depend on ngOpenTok.models.base", function() {
                expect(hasModule("ngOpenTok.models.base")).toBeTruthy();
            });
        });

    });


})();
