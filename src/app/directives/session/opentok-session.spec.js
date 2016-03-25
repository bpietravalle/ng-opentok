(function() {
    'use strict';

    describe("opentokSession Directive", function() {
        var $q, spy, $compile, ctrl, es, rs, handler, sessionSpy, scope, elem, iscope;

        beforeEach(function() {
            handler = jasmine.createSpy('handler');
            module('ngOpenTok.directives.session', function($provide) {
                $provide.value('OTApi', function($q) {
                    // return {
                    //     load: jasmine.createSpy('load').and.callFake(function() {
                            return $q.when({});
                        // })
                    // };
                });
                $provide.value('OTApi', function($q) {
                    // return {
                    //     load: jasmine.createSpy('load').and.callFake(function() {
                            return $q.when({});
                        // })
                    // };
                });
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
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
                streams: {
                    id: "streamsObj"
                },
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
                setPublisher: promiseWrap('setPublisher'),
                signal: promiseWrap('signal'),
                publisher: {},
                connections: {
                    id: "connections"
                },
                unsubscribe: promiseWrap('unsubscribe'),
                subscribe: promiseWrap('subscribe', {
                    element: "subscriberElement",
                    id: "subscriberId"
                }),
                forceUnpublish: promiseWrap('forceUnpublish'),
                forceDisconnect: promiseWrap('forceDisconnect')
            };
            // scope.myAuth = {
            //     token: "heresTheToken",
            //     sessionId: 'heresTheSessionId'
            // };
            scope.mySession = sessionSpy;
            scope.myEvents = {
                on: {
                    'event1': handler,
                    'event2': handler
                },
                once: {
                    'event3': handler
                }
            };
            elem = angular.element("<opentok-session " +
                " session='mySession' events='myEvents'" +
                "></opentok-session>");
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
                expect(ctrl.session).toBeDefined();
                expect(ctrl.session).toEqual(sessionSpy);
            });
            // it("should have publisher object", function() {
            //     expect(ctrl.publisher).toEqual(sessionSpy.publisher);
            // });
            // it("should have connections object", function() {
            //     expect(ctrl.connections).toEqual(sessionSpy.connections);
            // });
            // it("should have streams object", function() {
            //     expect(ctrl.streams).toEqual(sessionSpy.streams);
            // });
            it("should have events object", function() {
                expect(iscope.vm.events).toBeDefined();
            });
            describe("eventSetter", function() {
                describe("When scope.events is defined", function() {
                    it("should call eventSetter with scope and 'session'", function() {
                        expect(es.calls.argsFor(0)[1]).toEqual('session');
                        expect(es.calls.argsFor(0)[0].id).toEqual(scope.mySessionId);
                    });
                });
                describe("When scope.events isn't set", function() {
                    it("should not call eventSetter", function() {
                        elem = angular.element("<opentok-session auth='myAuth' " +
                            "></opentok-session>");
                        $compile(elem)(scope);
                        scope.$digest();
                        expect(es.calls.count()).toEqual(1);

                    });
                });
            });
        });
        describe("Controller", function() {
            it("should be defined", function() {
                expect(ctrl).toBeDefined();
            });
            it("should take 'autoSubscribe' prop from session obj", function() {
                expect(ctrl.autoSubscribe()).toEqual(sessionSpy.autoSubscribe);
            });
            it("getStreams() should return'streams' prop from session obj", function() {
                expect(ctrl.getStreams()).toEqual(sessionSpy.streams);
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
                it('should call "setPublisher" on session model', function() {
                    ctrl.addPublisher({
                        publisher: "obj"
                    });
                    expect(sessionSpy.setPublisher).toHaveBeenCalledWith({
                        publisher: "obj"
                    });
                });
                // describe("When autoPublish===true", function() {
                //     it("should call session.publish", function() {
                //         sessionSpy.autoPublish = true;
                //         elem = angular.element("<opentok-session auth='myAuth' " +
                //             "events='myEvents'" +
                //             "></opentok-session>");
                //         $compile(elem)(scope);
                //         scope.$digest();
                //         ctrl.addPublisher({
                //             publisher: "obj"
                //         });
                //         expect(sessionSpy.publish).toHaveBeenCalled();
                //     });
                // });
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
