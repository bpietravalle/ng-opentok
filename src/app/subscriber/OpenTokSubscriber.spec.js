(function() {
    'use strict';
    describe('OpenTokSubscriber', function() {
        var test, subject, rs, subscriberSpy;
        afterEach(function() {
            subject = null;
        });
        beforeEach(function() {
            subscriberSpy = {
                element: "element",
                id: "id",
                stream: {
                    stream: "obj"
                },
                on: jasmine.createSpy('on'),
                once: jasmine.createSpy('once'),
                getStats: jasmine.createSpy('getStats')
            };
        });
        describe("getOptions", function() {
            describe("With Defaults", function() {
                beforeEach(function() {
                    module('ngOpenTok.models.subscriber');
                    inject(function(_OpenTokSubscriber_) {
                        subject = _OpenTokSubscriber_.getOptions()
                    });
                });
                afterEach(function() {
                    subject = null;
                });
                it("should return params", function() {

                    expect(subject.targetElement).toEqual("SubscriberContainer");
                    expect(subject.targetProperties).toEqual({
                        height: 300,
                        width: 400
                    });
                });
            });
            describe("With Configured", function() {
                beforeEach(function() {
                    module('ngOpenTok.models.subscriber', function(OpenTokSubscriberProvider) {
                        OpenTokSubscriberProvider.configure({
                            targetElement: "different",
                            targetProperties: {
                                height: 500,
                                width: 300
                            }
                        });

                        inject(function(_OpenTokSubscriber_) {
                            subject = _OpenTokSubscriber_.getOptions()
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
        });
        describe("With Valid configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.subscriber');
                inject(function(_OpenTokSubscriber_, _$rootScope_) {
                    rs = _$rootScope_;
                    subject = _OpenTokSubscriber_.init(subscriberSpy);
                });
                rs.$digest();

            });
            afterEach(function() {
                subject = null;
            });
            it("should be defined", function() {
                expect(subject).toBeDefined();
            });
            describe("inspect", function() {
                describe("without arguments", function() {
                    it("should return the 'self' object", function() {
                        test = subject.inspect();
                        expect(test).toEqual(jasmine.objectContaining({
                            _options: jasmine.any(Object)
                        }));
                    });
                });
                describe("when passing an argument", function() {
                    it("should only return the specific property of the self obj", function() {
                        test = subject.inspect("options");
                        expect(test).toBeAn('object');
                    });
                });
            });
            describe("properties", function() {
                var props = ['element', 'id', 'stream'];

                function testProps(y) {
                    describe(y, function() {
                        it("should have a " + y + " property", function() {
                            expect(subject[y]).toBeDefined();
                        });
                    });
                }
                props.forEach(testProps);
            });
            describe("Queries", function() {
                var ctx = {
                    context: "of fn call"
                };
                var queries = [
                    ['on', ['onEventName'], 'eventHandler'],
                    ['on', ['onEventName', ctx], 'eventHandler'],
                    ['once', ['onceEventName'], 'eventHandler'],
                    ['once', ['onceEventName', ctx], 'eventHandler']
                ];

                function testQueries(y) {
                    describe(y[0], function() {
                        var fn, spy, utils;
                        beforeEach(function() {
                            rs.$digest();
                            utils = subject.inspect('utils');
                            spyOn(utils, y[2]).and.callThrough();
                            subject[y[0]].apply(subject, y[1]);
                            rs.$digest();
                            spy = subject.inspect('subscriber');
                            fn = jasmine.any(Function);
                        });
                        it("should pass params to OT api", function() {
                            expect(spy[y[0]].calls.argsFor(0)[0]).toEqual(y[1][0]);
                            expect(spy[y[0]].calls.argsFor(0)[1]).toEqual(fn);
                        });
                        if (y[1].length === 1) {
                            describe("Context - if ctx arg is undefined", function() {
                                it("should set context to the current subscriber object", function() {
                                    expect(utils[y[2]].calls.argsFor(0)[1]).toEqual(spy);
                                });
                            });
                        } else {
                            describe("Context - if ctx arg is defined", function() {
                                it("should pass arg to the current subscriber object", function() {
                                    expect(utils[y[2]].calls.argsFor(0)[1]).toEqual(ctx);
                                });
                            });
                        }
                    });
                }
                queries.forEach(testQueries);
                var getStats = [
                    ['getStats', [], 'handler'],
                    ['getStats', [ctx], 'handler']
                ];

                function testGetStats(y) {
                    describe(y[0], function() {
                        var fn, spy, utils;
                        beforeEach(function() {
                            rs.$digest();
                            utils = subject.inspect('utils');
                            spyOn(utils, y[2]).and.callThrough();
                            subject[y[0]].apply(subject, y[1]);
                            rs.$digest();
                            spy = subject.inspect('subscriber');
                            fn = jasmine.any(Function);
                        });
                        it("should pass params to OT api", function() {
                            expect(spy[y[0]].calls.argsFor(0)[0]).toEqual(fn);
                        });
                        if (y[1].length === 0) {
                            describe("Context - if ctx arg is undefined", function() {
                                it("should set context to the current subscriber object", function() {
                                    expect(utils[y[2]].calls.argsFor(0)[1]).toEqual(spy);
                                });
                            });
                        } else {
                            describe("Context - if ctx arg is defined", function() {
                                it("should pass arg to the current subscriber object", function() {
                                    expect(utils[y[2]].calls.argsFor(0)[1]).toEqual(ctx);
                                });
                            });
                        }
                    });
                }
                getStats.forEach(testGetStats);
            });
        });
    });
})();
