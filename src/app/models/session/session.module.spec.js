(function() {
    'use strict'

    describe("ngOpenTok.models.session Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.models.session');
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
                deps = module.value('ngOpenTok.models.session').requires;
            });
            it("should depend on ngOpenTok.utils", function() {
                expect(hasModule("ngOpenTok.utils")).toBeTruthy();
            });
            it("should depend on ngOpenTok.config", function() {
                expect(hasModule("ngOpenTok.config")).toBeTruthy();
            });
            it("should depend on ngOpenTok.OTApi", function() {
                expect(hasModule("ngOpenTok.OTApi")).toBeTruthy();
            });
        });

    });


})();
