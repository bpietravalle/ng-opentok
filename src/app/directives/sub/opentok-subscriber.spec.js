(function() {
    'use strict';

    describe("opentokSubscriber Directive", function() {
        var $compile, sessionCtrl, rs, sessionSpy, scope, es, elem, subSpy;

        beforeEach(function() {
            module('ngOpenTok.directives.subscriber', function($provide) {
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });

                $provide.factory('openTokSubscriber', function($q) {
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
            inject(function(_$compile_, _eventSetter_, _$rootScope_) {
                es = _eventSetter_;
                $compile = _$compile_;
                rs = _$rootScope_;
                scope = rs.$new()
            });
            sessionCtrl = {
                getSession: function() {
                    return sessionSpy;
                },
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
            elem = angular.element("<opentok-session><opentok-subscriber onEvents='myEvents1' " +
                "onceEvents='myEvents2' props='targetProperties' stream='stream'></opentok-subscriber></opentok-session>");
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
        describe("Initialization", function() {
            it("should call init on subscriber with element and properties object", function() {
                var ctrl = sessionCtrl;
                expect(ctrl.subscribe.calls.argsFor(0)[1].localName).toEqual("opentok-subscriber");
                expect(ctrl.subscribe.calls.argsFor(0)[2]).toEqual({
                    height: 300,
                    width: 400
                });
            });
            it("should call 'eventSetter' with scope and 'subscriber'", function() {
                expect(es.calls.argsFor(0)[1]).toEqual('subscriber');
                expect(es.calls.argsFor(0)[0].subscriber).toEqual(subSpy);
                expect(es.calls.argsFor(0)[0].props()).toEqual(scope.targetProperties);
            });
        });
        describe('Scope Events', function() {
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
