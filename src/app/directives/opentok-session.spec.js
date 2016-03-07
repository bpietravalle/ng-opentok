(function() {
    'use strict';

    describe("opentokSession Directive", function() {
        var ctrl, es, rs, handler, sessionSpy, scope, elem, iscope;

        beforeEach(function() {
            handler = jasmine.createSpy('handler');
            module('ngOpenTok.directives', function($provide) {
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });

                $provide.factory('openTokSession', function($q) {
                    function promiseWrap(name, obj) {
                        if (!obj) {
                            obj = {}
                        }
                        return jasmine.createSpy(name).and.callFake(function() {
                            return $q.when(obj);
                        });
                    }
                    return function() {
                        sessionSpy = {
                            once: promiseWrap('once'),
                            on: promiseWrap('on'),
                            connect: promiseWrap('connect'),
                            publish: promiseWrap('publish'),
                            signal: promiseWrap('subscribe'),
                            subscribe: promiseWrap('subscribe', {
                                element: "subscriberElement",
                                id: "subscriberId"
                            }),
                            forceUnpublish: promiseWrap('forceUnpublish'),
                            forceDisconnect: promiseWrap('forceDisconnect')
                        };
                        return sessionSpy;
                    };
                });
            });
            inject(function($compile, _eventSetter_, _$rootScope_) {
                rs = _$rootScope_;
                es = _eventSetter_;
                scope = rs.$new()
                scope.mySession = {};
                scope.token = "heresTheToken";
                scope.mySessionId = "heresTheSessionId";
                scope.pcontainer = "heresTheContainer"
                scope.mySessionOnEvents = {
                    'event1': handler,
                    'event2': handler
                };
                scope.mySessionOnceEvents = {
                    'event3': handler
                };
                elem = angular.element("<opentok-session token='token' once-events='mySessionOnceEvents' id='mySessionId' session='mySession' on-events='mySessionOnEvents'></opentok-session>");
                $compile(elem)(scope);
                scope.$digest();
                iscope = elem.isolateScope();
                ctrl = elem.controller('opentokSession');
            });
        });
        afterEach(function() {
            scope = null;
            elem = null;
        });
        describe("Template", function() {
            it("should compile", function() {
                expect(elem.html()).toBeDefined();
            });
            it("should have correct 'class'", function() {
                expect(elem.find('div').attr('class')).toEqual("opentok-session-container")
            });
        });
        describe("Scope", function() {
            it("should have sessionId attr", function() {
                expect(iscope.id).toBeDefined();
                expect(iscope.id()).toEqual("heresTheSessionId");
            });
            it("should have token object", function() {
                expect(iscope.token).toBeDefined();
                expect(iscope.token()).toEqual("heresTheToken");
            });
            it("should have session object", function() {
                expect(iscope.session).toBeDefined();
            });
            it("should have onEvents object", function() {
                expect(iscope.onEvents).toBeDefined();
            });
            it("should have onceEvents object", function() {
                expect(iscope.onceEvents).toBeDefined();
            });
            // it("should check if 
        });
        describe('initializing session', function() {
            it("should set session object to sessionSpy", function() {
                rs.$digest();
                expect(iscope.session).toEqual(sessionSpy);
            });
            it("session object should call connect with token", function() {
                rs.$digest();
                expect(iscope.session.connect).toHaveBeenCalled();
                var t = iscope.session.connect.calls.argsFor(0)[0]();
                expect(t).toEqual('heresTheToken');
            });
            it("should call eventSetter with scope and 'session'", function() {
                expect(es.calls.argsFor(0)[1]).toEqual('session');
                expect(es.calls.argsFor(0)[0].token()).toEqual(scope.token);
                expect(es.calls.argsFor(0)[0].id()).toEqual(scope.mySessionId);
            });
        });
        describe("Controller", function() {
            it("should be defined", function() {
                expect(ctrl).toBeDefined();
            });
            describe("getSession", function() {
                it("should return session obj", function() {
                    expect(ctrl.getSession()).toEqual(iscope.session);
                });
            });

        });

        // it("
        //                     should be defined ", function() {
        // //     expect(iscope).toEqual("
        //                     as ");
        // // });
        // // describe("
        //                     Properties ", function() {
        // //     describe("
        //                     SessionId ", function() {
        // //         it("
        //                     should work ", function() {
        // //             expect(elem.html()).toBeDefined();
        //         });
        //     });
        // });
    });
})();
