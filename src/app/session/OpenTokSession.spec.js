(function() {
    'use strict';
    describe('OpenTokSession', function() {
        var to, rs, subject, media, test, $q, ApiSpy, subscriber;
        beforeEach(function() {
            ApiSpy = {
                initSession: jasmine.createSpy('initSession').and.callFake(function() {
                    return {
                        capabilities: "asdf",
                        connection: {},
                        sessionId: "mySessionId",
                        once: jasmine.createSpy('once'),
                        on: jasmine.createSpy('on'),
                        connect: jasmine.createSpy('connect'),
                        publish: jasmine.createSpy('publish'),
                        signal: jasmine.createSpy('signal'),
                        subscribe: jasmine.createSpy('subscribe').and.returnValue({
                            element: "subscriberElement",
                            id: "subscriberId"
                        }),
                        forceUnpublish: jasmine.createSpy('forceUnpublish'),
                        forceDisconnect: jasmine.createSpy('forceDisconnect')
                    };
                })
            };
        });
        describe("With invalid configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.session', function($provide) {
                    $provide.value('SessionEvents', {});
                    $provide.value('Publisher', {});
                    $provide.value('Subscriber', {});
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                });
                inject(function(_OpenTokSession_) {
                    subject = _OpenTokSession_;
                });
            });
            afterEach(function() {
                subject = null;
            });
            it("should throw error if apiKey isn't defined", function() {
                expect(function() {
                    subject();
                }).toThrowError("Please set apiKey during the config phase of your module")
            });
        });
        describe("Without token and session configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.session', function($provide, OpenTokSessionProvider) {
                    $provide.value('SessionEvents', {});
                    $provide.factory('media', function() {
                        return {
                            getSessionId: jasmine.createSpy('getSessionId').and.returnValue("mySessionId")
                        };
                    });
                    $provide.value('participants', {});
                    $provide.value('publisher', {});
                    $provide.value('subscriber', {});
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                    OpenTokSessionProvider.configure({
                        apiKey: 12345,
                        session: false,
                        token: false
                    });
                });
                inject(function(_media_, _$timeout_, _OpenTokSession_, _$rootScope_) {
                    subject = _OpenTokSession_;
                    rs = _$rootScope_;
                    to = _$timeout_;
                    media = _media_;
                });
            });
            afterEach(function() {
                subject = null;
            });

            var tsMeths = ['tokenService', 'tokenMethod', 'tokenObject', 'getToken',
                'sessionService', 'sessionIdMethod', 'sessionObject'
            ];

            function tokenAndSessionTest(y) {
                it(y + " should not be defined", function() {
                    expect(subject().inspect(y)).not.toBeDefined();
                });
            }
            tsMeths.forEach(tokenAndSessionTest);
            describe('initization', function() {
                // var spy;
                beforeEach(function() {
                    test = subject("sessionString", "notPassedCTX");
                    to.flush();
                    rs.$digest();
                });
                it("should pass arg to OT Api", function() {
                    expect(ApiSpy.initSession).toHaveBeenCalledWith(12345, "sessionString");
                });
                it("should not pass ctx argument", function() {
                    expect(ApiSpy.initSession).not.toHaveBeenCalledWith("notPassedCTX");
                });
                it("should not call default sessionService", function() {
                    expect(media.getSessionId).not.toHaveBeenCalled();
                });
            });
            describe('connect', function() {
                var spy;
                beforeEach(function() {
                    subject = subject();
                    to.flush();
                    rs.$digest();
                    spy = subject.inspect('session');
                    test = subject.connect("token", "notPassedCTX");
                    rs.$digest();
                });
                it("should pass token to session.connect", function() {
                    expect(spy.connect).toHaveBeenCalledWith('token', jasmine.any(Function));
                });
                it("should not pass ctx argument", function() {
                    expect(spy.connect).not.toHaveBeenCalledWith("notPassedCTX");
                });
            });
        });
        describe("With Valid configuration", function() {
            beforeEach(function() {

                module('ngOpenTok.models.session', function($provide, OpenTokSessionProvider) {
                    OpenTokSessionProvider.setApiKey(12345);
                    $provide.factory('SessionEvents', function() {
                        return {};
                    });
                    $provide.factory('media', function() {
                        return {
                            getSessionId: jasmine.createSpy('getSessionId').and.returnValue("mySessionId")
                        };
                    });
                    $provide.factory('participants', function() {
                        return {
                            getToken: jasmine.createSpy('getToken').and.callFake(function() {
                                return "participantToken";
                            })
                        };
                    });
                    $provide.factory('subscriber', function($q) {
                        return {
                            getOptions: jasmine.createSpy('getOptions').and.returnValue({
                                targetElement: 'SubscriberContainer',
                                targetProperties: {
                                    height: 300,
                                    width: 400
                                }
                            }),
                            init: jasmine.createSpy('init').and.returnValue($q.when({
                                subscriber: "object"
                            }))

                        };
                    });
                    $provide.factory('publisher', function($q) {
                        return function() {
                            return $q.when({
                                element: "element",
                                id: "id"
                            });
                        };
                    });
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                });
                inject(function(_subscriber_, _$q_, _$timeout_, _OpenTokSession_, _$rootScope_, _media_) {
                    media = _media_;
                    subscriber = _subscriber_;
                    $q = _$q_;
                    rs = _$rootScope_;
                    to = _$timeout_;
                    subject = _OpenTokSession_;
                });
            });
            afterEach(function() {
                subject = null;
            });
            it("should be defined", function() {
                expect(subject).toBeDefined();
            });
            it("should not throw error", function() {
                expect(function() {
                    subject;
                }).not.toThrow()

            });
            describe("Options", function() {
                beforeEach(function() {
                    subject = subject();
                    to.flush();
                    rs.$digest();
                });

                function defaultValues(y) {
                    it("should have a default for " + y[0] + " of: " + y[1], function() {
                        expect(subject.inspect(y[0])).toEqual(y[1]);
                    });
                }

                var defaults = [
                    ["sessionService", "media"],
                    ["subscriberService", "subscriber"],
                    ["tokenService", "participants"],
                    ["tokenMethod", "getToken"],
                    ["token", true],
                    ["publisherService", "publisher"],
                    ["sessionIdMethod", "getSessionId"]
                ];
                describe("Default Settings", function() {
                    defaults.forEach(defaultValues);
                });
            });
            describe("inspect", function() {
                var test;
                beforeEach(function() {
                    subject = subject();
                    to.flush();
                    rs.$digest();
                });
                describe("without arguments", function() {
                    it("should return the 'self' object", function() {
                        test = subject.inspect();
                        expect(test).toEqual(jasmine.objectContaining({
                            _timeout: jasmine.any(Function),
                            _injector: jasmine.any(Object),
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
            describe("initialize", function() {
                var ctx;

                describe("With ValidParams", function() {
                    describe("When args is undefined", function() {
                        beforeEach(function() {
                            test = subject(undefined, ctx);
                            to.flush();
                        });
                        it("should not throw an error", function() {
                            expect(function() {
                                test
                            }).not.toThrow();
                        });
                        it("should pass an empty array to sessionObject", function() {
                            expect(media.getSessionId.calls.argsFor(0)).toEqual([]);
                        });
                    });
                    describe("When args isn't an array", function() {
                        beforeEach(function() {
                            test = subject("bad", ctx);
                            to.flush();
                        });

                        it("should not throw an error", function() {
                            expect(function() {
                                test
                            }).not.toThrow();
                        });
                        it("should pass args to sessionIdService and method", function() {
                            expect(media.getSessionId).toHaveBeenCalledWith("bad");
                        });
                    });
                    describe("When args arg an array", function() {
                        beforeEach(function() {
                            test = subject(["correct", "params"], ctx);
                            to.flush();
                        });
                        it("should pass args to sessionIdService and method", function() {
                            expect(media.getSessionId).toHaveBeenCalledWith("correct", 'params');
                        });
                    });
                });
                describe("With Invalid", function() {
                    it("should call utils.standardError", function() {

                    });

                });
            });
            describe("properties", function() {
                beforeEach(function() {
                    subject = subject();
                    to.flush();
                    rs.$digest();
                });
                it("should have connection prop", function() {
                    expect(subject.connection).toEqual({});
                });
                it("should have a sessionId", function() {
                    expect(subject.sessionId).toEqual("mySessionId");
                });
                it("should have capabilities prop", function() {
                    expect(subject.capabilities).toEqual("asdf");
                });
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
                            subject = subject();
                            to.flush();
                            rs.$digest();
                            utils = subject.inspect('utils');
                            spyOn(utils, 'eventHandler').and.callThrough();
                            subject[y[0]].apply(subject, y[1]);
                            rs.$digest();
                            spy = subject.inspect('session');
                            fn = jasmine.any(Function);
                        });
                        it("should pass params to OT api", function() {
                            expect(spy[y[0]].calls.argsFor(0)[0]).toEqual(y[1][0]);
                            expect(spy[y[0]].calls.argsFor(0)[1]).toEqual(fn);
                        });
                        if (y[1].length === 1) {
                            describe("Context - if ctx arg is undefined", function() {
                                it("should set context to the current session object", function() {
                                    expect(utils.eventHandler.calls.argsFor(0)[1]).toEqual(spy);
                                });
                            });
                        } else {
                            describe("Context - if ctx arg is defined", function() {
                                it("should pass arg to the current session object", function() {
                                    expect(utils.eventHandler.calls.argsFor(0)[1]).toEqual(ctx);
                                });
                            });
                        }
                    });
                }
                queries.forEach(testQueries);
            });
            describe("Commands", function() {
                var commands = [
                    ['forceUnpublish', [{
                        stream: 'object'
                    }]],
                    ['forceDisconnect', [{
                        connection: 'object'
                    }]],
                    ['signal', [{
                        data: 'object'
                    }]]
                ];

                function testCommands(y) {
                    describe(y[0], function() {
                        var fn, spy;
                        beforeEach(function() {
                            subject = subject();
                            to.flush();
                            rs.$digest();
                            subject[y[0]].apply(subject, y[1]);
                            rs.$digest();
                            spy = subject.inspect('session');
                            fn = jasmine.any(Function);
                        });
                        it("should pass param to OT api", function() {
                            y[1].push(fn);
                            expect(spy[y[0]].calls.argsFor(0)).toEqual(y[1]);
                        });
                    });
                }
                commands.forEach(testCommands);
                describe("Subscribe", function() {
                    var spy, streamSpy;
                    beforeEach(function() {
                        subject = subject();
                        to.flush();
                        rs.$digest();
                        streamSpy = jasmine.createSpy('streamSpy');
                        spy = subject.inspect('session');
                    });
                    it("should throw error if stream obj is undefined", function() {
                        expect(function() {
                            subject.subscribe();
                            rs.$digest();
                        }).toThrow();
                    });
                    it("should pass stream object to session.subscribe", function() {
                        test = subject.subscribe(streamSpy);
                        rs.$digest();
                        expect(spy.subscribe.calls.argsFor(0)[0]).toEqual(streamSpy);
                    });
                    describe("When passing args", function() {
                        it("should pass arg to session.subscribe", function() {
                            test = subject.subscribe(streamSpy, "target", {
                                props: "object"
                            });
                            rs.$digest();
                            expect(spy.subscribe.calls.argsFor(0)[1]).toEqual("target");
                            expect(spy.subscribe.calls.argsFor(0)[2]).toEqual({
                                props: "object"
                            });
                            expect(spy.subscribe.calls.argsFor(0)[3]).toEqual(jasmine.any(Function));
                        });
                    });
                    describe("Without passing args", function() {
                        it("should pass defaults session.subscribe", function() {
                            test = subject.subscribe(streamSpy);
                            rs.$digest();
                            expect(spy.subscribe.calls.argsFor(0)[1]).toEqual("SubscriberContainer");
                            expect(spy.subscribe.calls.argsFor(0)[2]).toEqual({
                                height: 300,
                                width: 400
                            });
                            expect(spy.subscribe.calls.argsFor(0)[3]).toEqual(jasmine.any(Function));
                        });
                    });
                    it("should pass returned subscriber object to subscriber service", function() {
                        var utils = subject.inspect('utils');
                        spyOn(utils, 'handler').and.returnValue($q.when({
                            subscriber: "object"
                        }));
                        test = subject.subscribe(streamSpy);
                        rs.$digest();
                        expect(subscriber.init).toHaveBeenCalledWith({
                            subscriber: "object"
                        });
                        expect(subject.inspect('subscriber')).toBeDefined();
                    });
                });
                describe('connect', function() {
                    var tokenObj, sessionObj;
                    beforeEach(function() {
                        subject = subject();
                        to.flush();
                        rs.$digest();
                        sessionObj = subject.inspect('session');
                        tokenObj = subject.inspect('tokenObject');
                        test = subject.connect("token", {
                            ctx: "obj"
                        });
                        to.flush();
                        rs.$digest();
                    });
                    it("should pass args to tokenService.getToken", function() {
                        expect(tokenObj.getToken).toHaveBeenCalledWith('token');
                    });
                    it("should pass token to session.connect", function() {
                        expect(sessionObj.connect).toHaveBeenCalledWith('participantToken', jasmine.any(Function));
                    });
                });
                describe("Publish", function() {
                    var spy;
                    beforeEach(function() {
                        subject = subject();
                        to.flush();
                        rs.$digest();
                        spy = subject.inspect('session');
                    });
                    describe("When passing an object", function() {
                        it("should pass object to session.publish", function() {
                            test = subject.publish({
                                hi: "I'm a stream"
                            });
                            rs.$digest();
                            expect(spy.publish).toHaveBeenCalledWith({
                                hi: "I'm a stream"
                            }, jasmine.any(Function));
                        });
                    });
                    describe("When target and property arguments", function() {
                        it("should pass object to session.publish", function() {
                            test = subject.publish("differentTarget", {
                                different: "properties"
                            });
                            rs.$digest();
                            expect(spy.publish).toHaveBeenCalledWith({
                                element: "element",
                                id: "id"
                            }, jasmine.any(Function));
                        });

                    });
                    describe("Without passing args", function() {
                        it("should pass publisher obj from Api to session.publish", function() {
                            test = subject.publish();
                            rs.$digest();
                            expect(spy.publish).toHaveBeenCalledWith({
                                element: "element",
                                id: "id"
                            }, jasmine.any(Function));
                        });
                    });
                });
            });
        });
    });
})();
