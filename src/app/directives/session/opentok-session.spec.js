(function() {
    'use strict';

    describe("opentokSession Directive", function() {
        var $q, spy, $compile, ctrl, es, rs, handler, sessionSpy, scope, elem, iscope;

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
                    return function() {
                        return $q.when(sessionSpy);
                    };
                });
            });
            inject(function(_$q_, _$compile_, _eventSetter_, _$rootScope_) {
                rs = _$rootScope_;
                $q = _$q_;
                es = _eventSetter_;
                $compile = _$compile_;
                scope = rs.$new()
            });

            function promiseWrap(name) {
                return jasmine.createSpy(name).and.callFake(function(obj) {
                    if (!obj) {
                        obj = {}
                    }
                    return $q.when(obj);
                });
            }
            sessionSpy = {
                autoSubscribe: true,
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
                publishers: [],
                unsubscribe: promiseWrap('unsubscribe'),
                subscribe: promiseWrap('subscribe', {
                    element: "subscriberElement",
                    id: "subscriberId"
                }),
                forceUnpublish: promiseWrap('forceUnpublish'),
                forceDisconnect: promiseWrap('forceDisconnect')
            };
            scope.mySession = sessionSpy;
            scope.token = "heresTheToken";
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
            spy = jasmine.createSpy('spy');
            iscope.$on('sessionReady', spy);
            ctrl = elem.controller('opentokSession');
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
            // it("session object should call connect with token", function() {
            //     rs.$digest();
            //     expect(iscope.session.connect).toHaveBeenCalled();
            //     var t = iscope.session.connect.calls.argsFor(0)[0];
            //     expect(t).toEqual('heresTheToken');
            // });
            it("should call eventSetter with scope and 'session'", function() {
                expect(es.calls.argsFor(0)[1]).toEqual('session');
                expect(es.calls.argsFor(0)[0].id).toEqual(scope.mySessionId);
            });
            it("should broadcast 'sessionReady' message", function() {
                // elem = angular.element("<opentok-session publishers='myPublishers' " +
                //     "token='token' once-events='mySessionOnceEvents' id='mySessionId' " +
                //     "session='mySession' on-events='mySessionOnEvents'></opentok-session>");
                // $compile(elem)(scope);
                // scope.$digest();
                // iscope = elem.isolateScope();
                rs.$digest();
                // iscope.$digest();
                // expect(spy).toHaveBeenCalled();
            });
        });
        describe("Controller", function() {
            it("should be defined", function() {
                expect(ctrl).toBeDefined();
            });
            it("should take 'autoSubscribe' prop from session obj", function() {
                expect(ctrl.autoSubscribe()).toEqual(sessionSpy.autoSubscribe);
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
            describe('addPublisher', function() {
                it('should set "publisher" property of session', function() {
                    expect(iscope.session.publisher).not.toBeDefined();
                    ctrl.addPublisher({
                        publisher: "obj"
                    });
                    expect(iscope.session.publisher).toEqual({
                        publisher: "obj"
                    });
                });
                describe("When autoPublish===true", function() {
                    it("should call session.publish", function() {
                        iscope.session.autoPublish = true;
                        ctrl.addPublisher({
                            publisher: "obj"
                        });
                        expect(sessionSpy.publish).toHaveBeenCalled();
                    });
                });
            });
            describe('remove', function() {
                // it("should throw an error if invalid type", function() {
                //     expect(function() {
                //         ctrl.remove('stuff', {});
                //     }).toThrow();
                // });
                // it("should remove publisher from array", function() {
                //     iscope.publishers.push('a');
                //     iscope.publishers.push('b');
                //     iscope.publishers.push('c');
                //     expect(iscope.publishers).toHaveLength(3);
                //     ctrl.remove('publishers', 'a');
                //     expect(iscope.publishers).toHaveLength(2);
                // });
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
