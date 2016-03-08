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
            var mods = ['loader', 'utils', 'models', 'directives'];

            function modTest(y) {
                it("should depend on ngOpenTok." + y, function() {
                    expect(hasModule("ngOpenTok." + y)).toBeTruthy();
                });
            }
            mods.forEach(modTest);
        });

    });


})();
