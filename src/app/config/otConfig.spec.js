(function() {
    'use strict';
    describe("otConfiguration", function() {
        var subject;
        beforeEach(function() {
            module('ngOpenTok.config', function(otConfigurationProvider) {
                otConfigurationProvider.configure({
                    targetElement: "different",
                    targetProperties: {
                        height: 500,
                        width: 300
                    }
                });

                inject(function(otConfiguration) {
                    subject = otConfiguration;
                });
            });
            afterEach(function() {
                subject = null;
            });
            it("should return preset params", function() {
                expect(subject.targetElement).toEqual("different");
                expect(subject.targetProperties).toEqual({
                    height: 500,
                    width: 300
                });
            });
        });
    });

})();
