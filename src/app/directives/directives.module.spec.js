(function() {
    'use strict'

    describe("ngOpenTok.directives Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.directives');
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
                deps = module.value('ngOpenTok.directives').requires;
            });
            it("should depend on ngOpenTok.models", function() {
                expect(hasModule("ngOpenTok.models")).toBeTruthy();
            });
        });

    });


})();
