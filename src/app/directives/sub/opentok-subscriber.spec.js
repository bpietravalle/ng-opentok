(function() {
    'use strict';

    describe("opentokSubscriber Directive", function() {
        var $q, parent, $compile, sessionCtrl, rs, sessionSpy, scope, es, elem, subSpy;

        beforeEach(function() {
            module('ngOpenTok.directives.subscriber', function($provide) {
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });
            });
            inject(function(_$q_, _$compile_, _eventSetter_, _$rootScope_) {
                es = _eventSetter_;
                $q = _$q_;
                $compile = _$compile_;
                rs = _$rootScope_;
                parent = rs.$new();
                scope = parent.$new();
            });

            function promiseWrap(name, obj) {
                if (!obj) {
                    obj = {}
                }
                return jasmine.createSpy(name).and.callFake(function() {
                    return $q.when(obj);
                });
            }
            subSpy = {
                on: promiseWrap('on'),
                once: promiseWrap('once'),
                element: {
                    style: {}
                },

                stream: {
                    "stream": "object"
                }
            };
            sessionCtrl = {
                getSession: function() {
                    return sessionSpy;
                },
                subscribe: jasmine.createSpy('subscribe').and.callFake(function() {
                    return $q.when(subSpy);
                }),
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
            scope.myEvents = {
                on: {},
                once: {}
            };
            elem = angular.element("<opentok-session><opentok-subscriber events='myEvents' " +
                "props='targetProperties' stream='stream'></opentok-subscriber></opentok-session>");
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
                it("should call init on subscriber with element and properties object", function() {
                    var ctrl = sessionCtrl;
                    parent.$broadcast('sessionReady');
                    expect(ctrl.subscribe.calls.argsFor(0)[1].localName).toEqual("opentok-subscriber");
                });
                describe("eventSetter", function() {
                    describe("When scope.events is defined", function() {
                        it("should call 'eventSetter' with scope and 'subscriber'", function() {
                            parent.$broadcast('sessionReady');
                            expect(es.calls.argsFor(0)[0].$parent).toEqual(scope);
                            expect(es.calls.argsFor(0)[1]).toEqual('subscriber');
                        });
                    });
                    describe("When scope.events isn't set", function() {
                        it("should not call eventSetter", function() {
                            expect(es.calls.count()).toEqual(1);
                            elem = angular.element("<opentok-session><opentok-subscriber " +
                                "props='targetProperties' stream='stream'></opentok-subscriber></opentok-session>");
                            elem.data({
                                '$opentokSessionController': sessionCtrl
                            });
                            expect(es.calls.count()).toEqual(1);

                        });
                    });
                });
            });
            describe('On destroy', function() {
                describe('when local', function() {
                    beforeEach(function() {
                        elem = compiledElem(elem, scope);
                        scope.$broadcast('$destroy');
                        rs.$digest();
                    });
                    it('should call ctrl.unsubscribe', function() {
                        expect(sessionCtrl.unsubscribe.calls.argsFor(0)[0]).toEqual({
                            "stream": "obj"
                        });
                    });
                });

            });
        });
    });
})();
