(function() {
    'use strict'

    describe("ngOpenTok.models Module", function() {
        var module;

        beforeEach(function() {
            module = angular.module('ngOpenTok.models');
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
                deps = module.value('ngOpenTok.models').requires;
            });
            it("should depend on ngOpenTok.models.session", function() {
                expect(hasModule("ngOpenTok.models.session")).toBeTruthy();
            });
            it("should depend on ngOpenTok.models.publisher", function() {
                expect(hasModule("ngOpenTok.models.publisher")).toBeTruthy();
            });
            it("should depend on ngOpenTok.models.subscriber", function() {
                expect(hasModule("ngOpenTok.models.subscriber")).toBeTruthy();
            });
        });

    });


})();
