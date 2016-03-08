(function() {
    'use strict';

    describe("opentokSession Directive", function() {
        var ctrl, es, rs, handler, sessionSpy, scope, elem, iscope;

        beforeEach(function() {
            handler = jasmine.createSpy('handler');
            module('ngOpenTok.directives.session', function($provide) {
                $provide.value('OTAsyncLoader', {});
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });

                $provide.factory('otSessionModel', function($q) {
                    function promiseWrap(name) {
                        return jasmine.createSpy(name).and.callFake(function(obj) {
                            if (!obj) {
                                obj = {}
                            }
                            return $q.when(obj);
                        });
                    }
                    return function() {
                        sessionSpy = {
                            connection: {
                                connectionId: "string",
                                data: "data",
                                capabilities: {
                                    forceDisconnect: 1,
                                    forceUnpublish: 1,
                                    publish: 1,
                                    subscribe: 1
                                }
                            },
                            once: promiseWrap('once'),
                            on: promiseWrap('on'),
                            connect: promiseWrap('connect'),
                            unpublish: promiseWrap('unpublish'),
                            publish: promiseWrap('publish'),
                            signal: promiseWrap('subscribe'),
                            unsubscribe: promiseWrap('unsubscribe'),
                            subscribe: promiseWrap('subscribe', {
                                element: "subscriberElement",
                                id: "subscriberId"
                            }),
                            forceUnpublish: promiseWrap('forceUnpublish'),
                            forceDisconnect: promiseWrap('forceDisconnect')
                        };
                        return $q.when(sessionSpy);
                    };
                });
            });
            inject(function($compile, _eventSetter_, _$rootScope_) {
                rs = _$rootScope_;
                es = _eventSetter_;
                scope = rs.$new()
                scope.mySession = {};
                scope.token = "heresTheToken";
                scope.myPublishers = [];
                scope.mySessionId = "heresTheSessionId";
                scope.pcontainer = "heresTheContainer"
                scope.mySessionOnEvents = {
                    'event1': handler,
                    'event2': handler
                };
                scope.mySessionOnceEvents = {
                    'event3': handler
                };
                elem = angular.element("<opentok-session publishers='myPublishers' " +
                    "token='token' once-events='mySessionOnceEvents' id='mySessionId' " +
                    "session='mySession' on-events='mySessionOnEvents'></opentok-session>");
                $compile(elem)(scope);
                scope.$digest();
                iscope = elem.isolateScope();
                ctrl = elem.controller('opentokSession');
            });
            sessionSpy.capabilities = 3;
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
                expect(iscope.id).toEqual("heresTheSessionId");
            });
            it("should have token object", function() {
                expect(iscope.token).toBeDefined();
                expect(iscope.token).toEqual("heresTheToken");
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
                var t = iscope.session.connect.calls.argsFor(0)[0];
                expect(t).toEqual('heresTheToken');
            });
            it("should call eventSetter with scope and 'session'", function() {
                expect(es.calls.argsFor(0)[1]).toEqual('session');
                expect(es.calls.argsFor(0)[0].token).toEqual(scope.token);
                expect(es.calls.argsFor(0)[0].id).toEqual(scope.mySessionId);
            });
        });
        describe("Controller", function() {
            it("should be defined", function() {
                expect(ctrl).toBeDefined();
            });
            var ctrlMeths = [
                ['publish', ['pubSpy']],
                ['subscribe', ['stream', 'element', 'props']],
                ['unpublish', ['pub']],
                ['unsubscribe', ['stream']],
                ['forceUnpublish', ['stream']],
                ['forceDisconnect', ['connection']],
                ['signal', ['dataToSend']]
            ];

            function testCtrlMeths(y) {
                describe(y[0], function() {
                    it('should call ' + y + ' on session object', function() {
                        ctrl[y[0]].apply(null, y[1]);
                        var l = y[1].length;
                        for (var i = 0; i < l; i++) {
                            expect(sessionSpy[y[0]].calls.argsFor(0)[i]).toEqual(y[1][i]);
                        }
                    });
                });

            }
            ctrlMeths.forEach(testCtrlMeths);
            describe('isLocal', function() {
                it("should return a boolean", function() {
                    var test = ctrl.isLocal('notLocal');
                    expect(test).toBeFalsey;
                    test = ctrl.isLocal('string');
                    expect(test).toBeTruthy;
                });
            });
            describe('isConnected', function() {
                it("should return a boolean", function() {
                    var test = ctrl.isConnected();
                    expect(test).toBeTruthy;
                });
            });
            describe('publish', function() {
                it("should add return value to publishers array", function() {
                    expect(iscope.publishers).toHaveLength(0);
                    var pubMock = {
                        publisher: 'obj'
                    };
                    ctrl.publish(pubMock);
                    rs.$digest();
                    expect(iscope.publishers).toHaveLength(1);
                    expect(iscope.publishers[0]).toEqual(pubMock);
                });
            });
            describe('remove', function() {
                it("should throw an error if invalid type", function() {
                    expect(function() {
                        ctrl.remove('stuff', {});
                    }).toThrow();
                });
                it("should throw error if obj not found", function() {
                    iscope.publishers.push('a');
                    iscope.publishers.push('b');
                    iscope.publishers.push('c');
                    expect(function() {
                        ctrl.remove('publishers', 'd');
                    }).toThrow();
                });
                it("should remove publisher from array", function() {
                    iscope.publishers.push('a');
                    iscope.publishers.push('b');
                    iscope.publishers.push('c');
                    expect(iscope.publishers).toHaveLength(3);
                    ctrl.remove('publishers', 'a');
                    expect(iscope.publishers).toHaveLength(2);
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
