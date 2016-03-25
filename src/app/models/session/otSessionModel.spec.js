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
            var otutil;
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
                inject(function(_otSessionModel_, _otutil_, $rootScope) {
                    subject = _otSessionModel_;
                    otutil = _otutil_;
                    rs = $rootScope;
                });
                spyOn(otutil, 'standardError');

            });
            describe("When token missing", function() {
                it("should call standarderror", function() {
                    subject({
                        sessionId: params.sessionId
                    });
                    rs.$digest();
                    expect(otutil.standardError).toHaveBeenCalled();
                });
            });
            describe("When sessionId missing", function() {
                it("should throw error", function() {
                    subject({
                        token: params.token
                    });
                    rs.$digest();
                    rs.$digest();
                    expect(otutil.standardError).toHaveBeenCalled();
                });
            });
        });
        describe("Valid Config", function() {
            describe("Without autoConnect or sessionEvents", function() {
                var utils, $q;
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
                    inject(function(_$q_, _otSessionModel_, _$rootScope_) {
                        otSessionModel = _otSessionModel_
                        $q = _$q_;
                        rs = _$rootScope_;
                    });
                });
                beforeEach(function(done) {
                    otSessionModel(params).then(function(res) {
                        subject = res;
                        spy = res.inspect('session');
                        utils = res.inspect('utils');
                    }, function() {
                        expect(1).toEqual(2);
                    });
                    rs.$digest();
                    done();
                });
                it("should pass arg to OT Api", function() {
                    expect(ApiSpy.initSession).toHaveBeenCalledWith(12345, params.sessionId);
                });
                // it("should not pass token to session.connect", function() {
                //     expect(spy.connect).not.toHaveBeenCalled();
                // });
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
                describe("errors", function() {
                    var meths = ['subscribe', 'connect', 'publish', 'signal', 'forceUnpublish', 'forceDisconnect'];

                    function methsTest(y) {
                        describe(y, function() {
                            beforeEach(function() {
                                spyOn(utils, 'standardError');
                                spyOn(utils, 'handler').and.callFake(function() {
                                    return $q.reject('ERROR');
                                });
                                if (y === 'subscribe' || y === 'publish') {
                                    subject[y]("stuff");
                                } else {
                                    subject[y]();
                                }
                                rs.$digest();
                            });
                            it("should send error to utils.standardError", function() {
                                expect(utils.standardError).toHaveBeenCalled();
                            });

                        });
                    }
                    meths.forEach(methsTest);
                });
            });
            describe("With autoConnect and sessionEvents", function() {
                var streamsMock, subMock, to, eventsService;
                beforeEach(function(done) {
                    subMock = {
                        id: "subscriber"
                    };
                    streamsMock = {
                        addManager: jasmine.createSpy('addManager')
                    };

                    module('ngOpenTok.models.session', function($provide) {
                        $provide.factory('otConfiguration', function() {
                            return {
                                getSession: jasmine.createSpy('getSession').and.callFake(function() {
                                    sessionConfigMock.events = true;
                                    sessionConfigMock.eventsService = "myOTSessionEvents";

                                    return sessionConfigMock
                                }),
                                getSubscriber: jasmine.createSpy('getSubscriber').and.callFake(function() {
                                    return subscriberConfigMock;
                                })
                            };
                        });
                        $provide.factory('myOTSessionEvents', function() {
                            return jasmine.createSpy('eventsService');
                        });
                        $provide.factory('otStreams', function() {
                            return function() {
                                return streamsMock;
                            };
                        });
                        $provide.factory('OTApi', function($q) {
                            return $q.when(ApiSpy);
                        });
                        $provide.factory('otSubscriberModel', function() {
                            return {
                                init: jasmine.createSpy('init').and.callFake(function() {
                                    return $q.when(subMock);
                                })
                            };
                        });
                    });
                    inject(function(_$q_, _myOTSessionEvents_, $timeout, _otSessionModel_, _$rootScope_) {
                        $q = _$q_;
                        eventsService = _myOTSessionEvents_;
                        to = $timeout;
                        otSessionModel = _otSessionModel_;
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
                  // expect(subject).toEqual("as")
                    expect(spy.connect).toHaveBeenCalledWith(params.token, jasmine.any(Function));
                });
                // it("should call the sessionEvents service", function() {
                //     to.flush();
                //     expect(eventsService).toHaveBeenCalled();
                // });
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
                            test = subject.inspect("apiKey");
                            expect(test).toBeA('number');
                        });
                    });
                });
                describe('setPublisher', function() {
                    it("should set the publisher property", function() {
                        expect(subject.publisher).toEqual({});
                        subject.setPublisher("pub");
                        to.flush();
                        expect(subject.publisher).toEqual("pub");

                    });

                });
                describe("properties", function() {
                    it("should have connections", function() {
                        var a = subject.connections;
                        var b = subject.connections;
                        a.add({
                            connectionId: "key1"
                        });
                        to.flush();
                        expect(b.getConnection('key1').connectionId).toEqual('key1');
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
                        var streamMock;
                        beforeEach(function() {
                            spyOn($q, 'reject');
                            streamMock = {
                                id: "key",
                                main: {
                                    main: "obj"
                                }
                            };
                        });
                        it("should pass stream.main object to session.subscribe", function() {
                            subject.subscribe(streamMock);
                            rs.$digest();
                            expect(spy.subscribe.calls.argsFor(0)[0]).toEqual(streamMock.main);
                        });
                        describe("When passing args", function() {
                            it("should pass arg to session.subscribe", function() {
                                subject.subscribe(streamMock, "target", {
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
                        describe("Without passing stream", function() {
                            it("should throw error", function() {
                                expect(function() {
                                    subject.subscribe();
                                    rs.$digest();
                                }).toThrow();
                            });
                        });
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
            describe("When using session and token services", function() {
                var media, participants, to;
                beforeEach(function() {
                    module('ngOpenTok.models.session', function($provide, otConfigurationProvider) {
                        otConfigurationProvider.configure({
                            apiKey: 12345
                        });
                        $provide.factory('SessionEvents', function() {
                            return {};
                        });
                        $provide.factory('media', function() {
                            return {
                                getSessionId: jasmine.createSpy('getSessionId').and.callFake(function(args) {
                                    if (args === false) {
                                        return {
                                            not: 'string'
                                        }
                                    } else {

                                        return "mySessionId";
                                    }
                                })
                            };
                        });
                        $provide.factory('participants', function() {
                            return {
                                getToken: jasmine.createSpy('getToken').and.callFake(function(args) {
                                    if (args === false) {
                                        return {
                                            not: 'string'
                                        }
                                    } else {
                                        return "participantToken";
                                    }
                                })
                            };
                        });
                        $provide.factory('OTApi', function($q) {
                            return $q.when(ApiSpy);
                        });
                    });
                    inject(function(_$q_, _participants_, _$timeout_, _otSessionModel_, _$rootScope_, _media_) {
                        media = _media_;
                        participants = _participants_;
                        $q = _$q_;
                        rs = _$rootScope_;
                        to = _$timeout_;
                        subject = _otSessionModel_;
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
                describe("initialize", function() {

                    describe("With ValidParams", function() {
                        beforeEach(function() {
                            test = subject({
                                sessionId: ["correct", "params"],
                                token: ['token', 'params']
                            });
                            to.flush();
                        });
                        it("should not throw an error", function() {
                            expect(function() {
                                test
                            }).not.toThrow();
                        });
                        it("should pass args to sessionIdService and method", function() {
                            expect(media.getSessionId).toHaveBeenCalledWith("correct", 'params');
                        });
                        it("should pass args to tokeService and method", function() {
                            expect(participants.getToken).toHaveBeenCalledWith("token", 'params');
                        });
                    });
                });
                describe("When services don't return strings", function() {
                    beforeEach(function() {
                        test = subject({
                            sessionId: [false],
                            token: [false]
                        });
                    });
                    it("should throw an error", function() {
                        expect(function() {
                            test
                            to.flush();
                        }).toThrow();
                    });
                });
            });
        });
    });
})();
