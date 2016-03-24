(function() {
    'use strict';
    describe("otConfiguration", function() {
        var subject;
        afterEach(function() {
            subject = null;
        });
        describe("Invalid Config", function() {
            describe("No ApiKey", function() {
                it("should throw error", function() {
                    expect(function() {
                        module('ngOpenTok.config', function(otConfigurationProvider) {
                            otConfigurationProvider.configure({
                                targetElement: "different",
                                targetProperties: {
                                    height: 500,
                                    width: 300
                                }
                            });
                        });

                        inject(function(otConfiguration) {
                            subject = otConfiguration;
                        });
                    }).toThrow();
                });
            });
        });
        describe("Valid Config", function() {
            describe("When 'apiKey' isn't nested within 'session'", function() {
                it("should nest value under 'session'", function() {
                    module('ngOpenTok.config', function(otConfigurationProvider) {
                        otConfigurationProvider.configure({
                            apiKey: 12345
                        });
                    });
                    inject(function(otConfiguration) {
                        subject = otConfiguration;
                    });
                    expect(subject.getSession().apiKey).toEqual(12345);
                });
            });
            describe("Defaults", function() {
                beforeEach(function() {
                    module('ngOpenTok.config', function(otConfigurationProvider) {
                        otConfigurationProvider.configure({
                            apiKey: 12345
                        });
                    });
                    inject(function(otConfiguration) {
                        subject = otConfiguration;
                    });
                });
                var defaultVals = [
                    ['getSession', [
                        ['autoConnect', true],
                        ['autoPublish', true],
                        ['events', false],
                        ['autoSubscribe', true]
                    ]],
                    ['getSubscriber'],
                    ['getPublisher']
                ];

                function defaultTest(y) {
                    describe(y[0], function() {
                        var test;
                        beforeEach(function() {
                            test = subject[y[0]]();
                        });
                        it("should be an object", function() {
                            expect(test).toBeAn('object');
                        });
                        if (y[0] !== 'getSession') {
                            it("should be empty", function() {
                                expect(Object.keys(test)).toHaveLength(0);
                            });
                        } else {

                            y[1].forEach(checkSession);
                        }

                        function checkSession(x) {
                            describe(x[0], function() {
                                it("should equal: " + x[1], function() {
                                    expect(test[x[0]]).toEqual(x[1]);
                                });
                            });
                        }
                    });
                }


                defaultVals.forEach(defaultTest);
            });
            describe("eventsService", function() {
                it("should name service 'events' by default", function() {
                    module('ngOpenTok.config', function(otConfigurationProvider) {
                        otConfigurationProvider.configure({
                            apiKey: 12345,
                            session: {
                                events: true
                            }
                        });
                    });
                    inject(function(otConfiguration) {
                        subject = otConfiguration;
                    });
                    expect(subject.getSession().eventsService).toEqual("otSessionEvents");
                });

            });

        });
    });

})();
