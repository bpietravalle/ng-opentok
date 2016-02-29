(function() {
    'use strict';
    describe("ngOpenTok.utils module", function() {
        describe("Module-Dependencies:", function() {
            var module;
            beforeEach(function() {
                module = angular.module("ngOpenTok.utils");
            });

            it("should exist", function() {
                expect(module).toBeDefined();
            });
            // describe("Dependencies:", function() {
            //     var deps;
            //     var hasModule = function(m) {
            //         return deps.indexOf(m) >= 0;
            //     };
            //     beforeEach(function() {
            //         deps = module.value('ngOpenTok.utils').requires;
            //     });
            // });
        });
    });

})();
