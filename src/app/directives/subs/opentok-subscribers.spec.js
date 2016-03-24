(function() {
    'use strict';

    describe("opentokSubscriber Directive", function() {
        var parent, $compile, sessionCtrl, rs, sessionSpy, scope, elem, subSpy;

        beforeEach(function() {
            module('ngOpenTok.directives.subscribers', function($provide) {
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });

                $provide.factory('otSubscriberModel', function($q) {
                    function promiseWrap(name, obj) {
                        if (!obj) {
                            obj = {}
                        }
                        return jasmine.createSpy(name).and.callFake(function() {
                            return $q.when(obj);
                        });
                    }
                    return {
                        init: jasmine.createSpy('init').and.callFake(function() {
                            subSpy = {
                                on: promiseWrap('on'),
                                once: promiseWrap('once'),
                                stream: {
                                    "stream": "object"
                                }
                            };

                            return subSpy;
                        })
                    };
                });
            });
            inject(function(_$compile_, _$rootScope_) {
                $compile = _$compile_;
                rs = _$rootScope_;
                parent = rs.$new();
                scope = parent.$new();
            });
            sessionCtrl = {
                getStreams: jasmine.createSpy('getStreams'),
                subscribe: jasmine.createSpy('subscribe'),
                unsubscribe: jasmine.createSpy('unsubscribe'),
                isConnected: function() {
                    return true
                }
            };

            scope.targetProperties = {
                height: 300,
                width: 400
            };
            scope.stream = {
                "stream": "obj"
            };
            scope.myEvents1 = {};
            scope.myEvents2 = {};
            elem = angular.element("<opentok-session><opentok-subscribers on-events='myEvents1' " +
                "stream='stream'></opentok-subscribers></opentok-session>");
            elem.data({
                '$opentokSessionController': sessionCtrl
            });
            compiledElem(elem, scope);
        });

        function compiledElem(e, s) {
            $compile(e)(s);
            s.$digest();
            return e;
        }
        afterEach(function() {
            scope = null;
            elem = null;
        });
        it("should be defined", function() {
            expect(elem.scope()).toBeDefined();
        });
        it("should compile correctly", function() {
            expect(elem.html()).toBeDefined();
        });
        describe('Scope Events', function() {
            describe("sessionReady", function() {
                it("should call getStreams", function() {
                    var ctrl = sessionCtrl;
                    parent.$broadcast('sessionReady');
                    expect(ctrl.getStreams).toHaveBeenCalled();
                });
                // it("should call 'eventSetter' with scope and 'subscribers'", function() {
                //     parent.$broadcast('sessionReady');
                //     expect(es.calls.argsFor(0)[1]).toEqual('subscribers');
                //     expect(es.calls.argsFor(0)[0].subscribers).toEqual(subSpy);
                // });
            });
            describe('On destroy', function() {
                // describe('when local', function() {
                //     beforeEach(function() {
                //         elem = compiledElem(elem, scope);
                //         scope.$broadcast('$destroy');
                //         rs.$digest();
                //     });
                //     it('should call ctrl.unsubscribe', function() {
                //         expect(sessionCtrl.unsubscribe.calls.argsFor(0)[0]).toEqual({
                //             "stream": "obj"
                //         });
                //     });
                // });

            });
        });
    });
})();
