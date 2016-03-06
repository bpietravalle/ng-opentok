(function() {
    'use strict';

    describe("opentokSession Directive", function() {
        var rs, handler, sessionSpy, scope, ctrl, elem, vm;

        beforeEach(function() {
            handler = jasmine.createSpy('handler');
            module('ngOpenTok.directives', function($provide) {
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
            inject(function($compile, _$rootScope_) {
                rs = _$rootScope_;
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
                ctrl = elem.controller('opentokSession');
                vm = elem.isolateScope().vm
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
        it("should have a controller", function() {
            expect(ctrl).toBeDefined();
        });
        describe("Scope", function() {
            it("should have sessionId attr", function() {
                expect(vm.id).toBeDefined();
                expect(vm.id()).toEqual("heresTheSessionId");
            });
            it("should have token object", function() {
                expect(vm.token).toBeDefined();
                expect(vm.token()).toEqual("heresTheToken");
            });
            it("should have session object", function() {
                expect(vm.session).toBeDefined();
            });
            it("should have onEvents object", function() {
                expect(vm.onEvents).toBeDefined();
            });
            it("should have onceEvents object", function() {
                expect(vm.onceEvents).toBeDefined();
            });
            // it("should check if 
        });
        describe('initializing session', function() {
            it("should set session object to sessionSpy", function() {
                rs.$digest();
                expect(vm.session).toEqual(sessionSpy);
            });
            it("session object should call connect with token", function() {
                rs.$digest();
                expect(vm.session.connect).toHaveBeenCalled();
                var t = vm.session.connect.calls.argsFor(0)[0]();
                expect(t).toEqual('heresTheToken');
            });
            it("shuold call on with scope.onEvents obj", function() {
                expect(vm.session.on.calls.argsFor(0)[0]).toEqual('event1');
                expect(vm.session.on.calls.argsFor(0)[1]).toEqual(handler);
                expect(vm.session.on.calls.argsFor(1)[0]).toEqual('event2');
                expect(vm.session.on.calls.argsFor(1)[1]).toEqual(handler);
            });
            it("should call once with scope.onceEvents properties", function() {
                expect(vm.session.once.calls.argsFor(0)[0]).toEqual('event3');
                expect(vm.session.once.calls.argsFor(0)[1]).toEqual(handler);
            });
        });

        // it("
        //                     should be defined ", function() {
        // //     expect(vm).toEqual("
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
