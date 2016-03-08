(function() {
    'use strict';
    describe('openTokPublisher', function() {
        var subject, rs, ApiSpy;
        beforeEach(function() {
            ApiSpy = {
                initPublisher: jasmine.createSpy('initPublisher').and.callFake(function() {
                    return {
                        id: "asdf",
                        element: {},
                        stream: {
                            stream: "object"
                        },
                        session: {
                            session: "object"
                        },
                        once: jasmine.createSpy('once'),
                        on: jasmine.createSpy('on'),
                        accessAllowed: true
                    };
                })
            };
        });
        afterEach(function() {
            subject = null;
            ApiSpy = null;
        });
        describe("getOptions", function() {
            describe("With Defaults", function() {
                beforeEach(function() {
                    module('ngOpenTok.models.publisher');
                    inject(function(_openTokPublisher_) {
                        subject = _openTokPublisher_.getOptions()
                    });
                });
                afterEach(function() {
                    subject = null;
                });
                it("should return params", function() {

                    expect(subject.targetElement).toEqual("PublisherContainer");
                    expect(subject.targetProperties).toEqual({
                        height: 300,
                        width: 400
                    });
                });
            });
            describe("With Configured", function() {
                beforeEach(function() {
                    module('ngOpenTok.models.publisher', function(openTokPublisherProvider) {
                        openTokPublisherProvider.configure({
                            targetElement: "different",
                            targetProperties: {
                                height: 500,
                                width: 300
                            }
                        });

                        inject(function(_openTokPublisher_) {
                            subject = _openTokPublisher_.getOptions()
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

        describe("Configured Setup - in module's config phase", function() {
            beforeEach(function() {
                module('ngOpenTok.models.publisher', function($provide, openTokPublisherProvider) {
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                    openTokPublisherProvider.configure({
                        targetElement: "different",
                        targetProperties: {
                            different: "props"
                        }
                    });
                });
                inject(function(_$rootScope_, _openTokPublisher_) {
                    subject = _openTokPublisher_;
                    rs = _$rootScope_;
                });
            });
            afterEach(function() {
                subject = null;
            });
            describe("With no args passed to Ctor", function() {
                beforeEach(function() {
                    subject.init();
                    rs.$digest();
                });
                it("should not call initPublisher with defaults", function() {
                    expect(ApiSpy.initPublisher).not.toHaveBeenCalledWith("PublisherContainer", {
                        height: 300,
                        width: 400
                    });
                });
                it("should pass specified options to initPublisher", function() {
                    expect(ApiSpy.initPublisher.calls.argsFor(0)[0]).toEqual("different");
                    expect(ApiSpy.initPublisher.calls.argsFor(0)[1]).toEqual({
                        different: "props"
                    });
                });
            });
            describe("With passing args to Ctor", function() {
                beforeEach(function() {
                    subject.init("evenMoreDifferent", {
                        veryDifferent: "props"
                    });
                    rs.$digest();
                });
                it("should not call initPublisher with defaults", function() {
                    expect(ApiSpy.initPublisher).not.toHaveBeenCalledWith("PublisherContainer", {
                        height: 300,
                        width: 400
                    });
                });
                it("should not pass preset options to initPublisher", function() {
                    expect(ApiSpy.initPublisher).not.toHaveBeenCalledWith("different", {
                        different: "props"
                    });
                });
                it("should pass specified options to initPublisher", function() {
                    expect(ApiSpy.initPublisher.calls.argsFor(0)[0]).toEqual("evenMoreDifferent");
                    expect(ApiSpy.initPublisher.calls.argsFor(0)[1]).toEqual({
                        veryDifferent: "props"
                    });
                });
            });
        });
        describe("Default configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.publisher', function($provide) {
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                });
                inject(function(_$rootScope_, _openTokPublisher_) {
                    subject = _openTokPublisher_;
                    rs = _$rootScope_;
                });
            });
            afterEach(function() {
                subject = null;
            });
            it("should pass default args to initPublisher", function() {
                subject.init();
                rs.$digest();
                expect(ApiSpy.initPublisher.calls.argsFor(0)[0]).toEqual("PublisherContainer");
                expect(ApiSpy.initPublisher.calls.argsFor(0)[1]).toEqual({
                    height: 300,
                    width: 400
                });
            });
        });
        describe("With Valid configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.publisher', function($provide) {
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                });
                inject(function(_openTokPublisher_, _$rootScope_) {
                    rs = _$rootScope_;
                    subject = _openTokPublisher_.init();
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
                var test;
                describe("without arguments", function() {
                    it("should return the 'self' object", function() {
                        test = subject.inspect();
                        expect(test).toEqual(jasmine.objectContaining({
                            _timeout: jasmine.any(Function),
                            // _props: jasmine.any(Object),
                            _options: jasmine.any(Object)
                        }));
                    });
                });
                describe("when passing an argument", function() {
                    it("should only return the specific property of the self obj", function() {
                        test = subject.inspect("timeout");
                        expect(test).toBeA('function');
                        test = subject.inspect("options");
                        expect(test).toBeAn('object');
                    });
                });
            });
            describe("properties", function() {
                var props = ['element', 'id'];

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
                    ['on', ['onEventName']],
                    ['on', ['onEventName', ctx]],
                    ['once', ['onceEventName']],
                    ['once', ['onceEventName', ctx]]
                ];

                function testQueries(y) {
                    describe(y[0], function() {
                        var fn, spy, utils;
                        beforeEach(function() {
                            rs.$digest();
                            utils = subject.inspect('utils');
                            spyOn(utils, 'eventHandler').and.callThrough();
                            subject[y[0]].apply(subject, y[1]);
                            rs.$digest();
                            spy = subject.inspect('publisher');
                            fn = jasmine.any(Function);
                        });
                        it("should pass params to OT api", function() {
                            expect(spy[y[0]].calls.argsFor(0)[0]).toEqual(y[1][0]);
                            expect(spy[y[0]].calls.argsFor(0)[1]).toEqual(fn);
                        });
                        if (y[1].length === 1) {
                            describe("Context - if ctx arg is undefined", function() {
                                it("should set context to the current publisher object", function() {
                                    expect(utils.eventHandler.calls.argsFor(0)[1]).toEqual(spy);
                                });
                            });
                        } else {
                            describe("Context - if ctx arg is defined", function() {
                                it("should pass arg to the current publisher object", function() {
                                    expect(utils.eventHandler.calls.argsFor(0)[1]).toEqual(ctx);
                                });
                            });
                        }
                    });
                }
                queries.forEach(testQueries);
            });
        });
    });

})();
