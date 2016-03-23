(function() {
    'use strict';
    describe('otSessionModel', function() {
        var sessionConfigMock, subscriberConfigMock, test, spy, otSessionModel, params, rs, subject, $q, ApiSpy;
        beforeEach(function() {
            sessionConfigMock = {
                apiKey: 12345,
                autoConnect: true
            };
            subscriberConfigMock = {
                targetElement: 'SubscriberContainer',
                targetProperties: {
                    height: 300,
                    width: 400
                }
            };
            params = {
                sessionId: "sessionKey",
                token: "tokenKey"
            };

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
        describe("Without correct params", function() {
            beforeEach(function() {
                module('ngOpenTok.models.session', function($provide) {
                    $provide.factory('otConfiguration', function() {
                        return {
                            getSession: jasmine.createSpy('getSession').and.callFake(function() {
                                return sessionConfigMock;
                            }),
                            getSubscriber: jasmine.createSpy('getSubscriber').and.callFake(function() {
                                return subscriberConfigMock;
                            })
                        };
                    });
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                });
                inject(function(_otSessionModel_, $rootScope) {
                    subject = _otSessionModel_;
                    rs = $rootScope;
                });
            });
            describe("When token missing", function() {
                it("should throw error", function() {
                    expect(function() {
                        subject({
                            sessionId: params.sessionId
                        });
                        rs.$digest();
                    }).toThrow();
                });
            });
            describe("When sessionId missing", function() {
                it("should throw error", function() {
                    expect(function() {
                        subject({
                            token: params.token
                        });
                        rs.$digest();
                    }).toThrow();
                });
            });
        });
        describe("Valid Config", function() {
            describe("Without autoConnect", function() {
                beforeEach(function() {
                    module('ngOpenTok.models.session', function($provide) {
                        $provide.factory('otConfiguration', function() {
                            return {
                                getSession: jasmine.createSpy('getSession').and.callFake(function() {
                                    sessionConfigMock.autoConnect = false;
                                    return sessionConfigMock;
                                }),
                                getSubscriber: jasmine.createSpy('getSubscriber').and.callFake(function() {
                                    return subscriberConfigMock;
                                })
                            };
                        });
                        $provide.factory('SessionEvents', function() {
                            return {};
                        });
                        $provide.factory('OTApi', function($q) {
                            return $q.when(ApiSpy);
                        });
                    });
                    inject(function(_otSessionModel_, _$rootScope_) {
                        otSessionModel = _otSessionModel_
                        rs = _$rootScope_;
                    });
                });
                beforeEach(function(done) {
                    otSessionModel(params).then(function(res) {
                        subject = res;
                        spy = res.inspect('session');
                    }, function() {
                        expect(1).toEqual(2);
                    });
                    rs.$digest();
                    done();
                });
                it("should pass arg to OT Api", function() {
                    expect(ApiSpy.initSession).toHaveBeenCalledWith(12345, params.sessionId);
                });
                it("should not pass token to session.connect", function() {
                    expect(spy.connect).not.toHaveBeenCalled();
                });
                it("should have a 'connect' method", function() {
                    expect(subject.connect).toBeDefined();
                });
                describe('connect', function() {
                    it("should pass token and callback to session object", function() {
                        subject.connect()
                        rs.$digest();
                        expect(spy.connect).toHaveBeenCalledWith(params.token, jasmine.any(Function));
                    });
                });
            });
            describe("With autoConnect", function() {
                beforeEach(function(done) {
                    module('ngOpenTok.models.session', function($provide) {
                        $provide.factory('otConfiguration', function() {
                            return {
                                getSession: jasmine.createSpy('getSession').and.callFake(function() {
                                    return sessionConfigMock
                                }),
                                getSubscriber: jasmine.createSpy('getSubscriber').and.callFake(function() {
                                    return subscriberConfigMock;
                                })
                            };
                        });
                        $provide.factory('SessionEvents', function() {
                            return {};
                        });
                        $provide.factory('OTApi', function($q) {
                            return $q.when(ApiSpy);
                        });
                    });
                    inject(function(_$q_, _otSessionModel_, _$rootScope_) {
                        $q = _$q_;
                        otSessionModel = _otSessionModel_
                        rs = _$rootScope_;
                    });
                    otSessionModel(params).then(function(res) {
                        subject = res;
                        spy = res.inspect('session');
                    }, function() {
                        expect(1).toEqual(2);
                    });
                    rs.$digest();
                    done();
                });
                it("should pass arg to OT Api", function() {
                    expect(ApiSpy.initSession).toHaveBeenCalledWith(12345, params.sessionId);
                });
                it("should pass token to session.connect", function() {
                    expect(spy.connect).toHaveBeenCalledWith(params.token, jasmine.any(Function));
                });
                it("should not have a 'connect' method", function() {
                    expect(subject.connect).not.toBeDefined();
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
                            test = subject.inspect("sessionId");
                            expect(test).toBeA('string');
                        });
                    });
                });
                describe("properties", function() {
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
                        var streamSpy;
                        beforeEach(function() {
                            spyOn($q, 'reject');
                            streamSpy = jasmine.createSpy('streamSpy');
                            spy = subject.inspect('session');
                        });
                        it("should pass stream object to session.subscribe", function() {
                            subject.subscribe(streamSpy);
                            rs.$digest();
                            expect(spy.subscribe.calls.argsFor(0)[0]).toEqual(streamSpy);
                        });
                        describe("When passing args", function() {
                            it("should pass arg to session.subscribe", function() {
                                subject.subscribe(streamSpy, "target", {
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
                        //TODO how passing args!
                        describe("Without passing args", function() {
                            it("should pass defaults session.subscribe", function() {
                                subject.subscribe(streamSpy);
                                rs.$digest();
                                // expect(spy.subscribe.calls.argsFor(0)[1]).toEqual("SubscriberContainer");
                                // expect(spy.subscribe.calls.argsFor(0)[2]).toEqual({
                                //     height: 300,
                                //     width: 400
                                // });
                                expect(spy.subscribe.calls.argsFor(0)[3]).toEqual(jasmine.any(Function));
                            });
                        });
                        // it("should pass returned subscriber object to subscriber service", function() {
                        //     var utils = subject.inspect('utils');
                        //     spyOn(utils, 'handler').and.returnValue($q.when({
                        //         subscriber: "object"
                        //     }));
                        //     subject.subscribe(streamSpy);
                        //     rs.$digest();
                        //     expect(subscriber.init).toHaveBeenCalledWith({
                        //         subscriber: "object"
                        //     });
                        //     expect(subject.inspect('subscriber')).toBeDefined();
                        // });
                    });
                    describe("Publish", function() {
                        beforeEach(function() {
                            spy = subject.inspect('session');
                        });
                        it("should pass subject.publisher to session.publish", function() {
                            subject.publisher = {
                                _publisher: {
                                    hi: "I'm a stream"
                                }
                            }
                            subject.publish();
                            rs.$digest();
                            expect(spy.publish).toHaveBeenCalledWith({
                                hi: "I'm a stream"
                            }, jasmine.any(Function));
                        });
                        describe("When publisher property is undefined", function() {
                            it("should throw error", function() {
                                expect(function() {
                                    subject.publish();
                                    rs.$digest();
                                }).toThrow();
                            });


                        });
                    });
                });
            });
        });
    });
})();
