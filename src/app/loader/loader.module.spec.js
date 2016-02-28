(function() {
    'use strict'

    describe("ngOpenTok.loader Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.loader');
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
                deps = module.value('ngOpenTok.loader').requires;
            });
            it("should depend on uuid", function() {
                expect(hasModule("uuid")).toBeTruthy();
            });
        });

    });


})();
