(function() {
    'use strict'

    describe("ngOpenTok Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok');
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
                deps = module.value('ngOpenTok').requires;
            });
            it("should depend on ngOpenTok.loader", function() {
                expect(hasModule("ngOpenTok.loader")).toBeTruthy();
            });
        });

    });


})();