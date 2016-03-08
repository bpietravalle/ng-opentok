(function() {
    'use strict'

    describe("ngOpenTok.directives.session Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.directives.session');
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
                deps = module.value('ngOpenTok.directives.session').requires;
            });
            it("should depend on ngOpenTok.models.session", function() {
                expect(hasModule("ngOpenTok.models.session")).toBeTruthy();
            });
            it("should depend on ngOpenTok.utils", function() {
                expect(hasModule("ngOpenTok.utils")).toBeTruthy();
            });
        });

    });


})();
