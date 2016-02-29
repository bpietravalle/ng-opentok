(function() {
    'use strict';
    describe("ngOpenTok.OTApi module", function() {
        describe("Module-Dependencies:", function() {
            var module;
            beforeEach(function() {
                module = angular.module("ngOpenTok.OTApi");
            });

            it("should exist", function() {
                expect(module).toBeDefined();
            });
            describe("Dependencies:", function() {
                var deps;
                var hasModule = function(m) {
                    return deps.indexOf(m) >= 0;
                };
                beforeEach(function() {
                    deps = module.value('ngOpenTok.OTApi').requires;
                });
                it("should depend on ngOpenTok.loader", function() {
                    expect(hasModule("ngOpenTok.loader")).toBeTruthy();
                });
            });
        });
    });

})();
