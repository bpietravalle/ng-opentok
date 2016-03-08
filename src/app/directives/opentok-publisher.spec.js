(function() {
    'use strict';

    describe("opentokPublisher Directive", function() {
        var $compile, sessionCtrl, rs, sessionSpy, scope, ot, es, elem, pubSpy;

        beforeEach(function() {
            module('ngOpenTok.directives.publisher', function($provide) {
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });

                $provide.factory('openTokPublisher', function($q) {
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
                            pubSpy = {
                                on: promiseWrap('on'),
                                once: promiseWrap('once'),
                                destroy: jasmine.createSpy('destroy')
                            };

                            return pubSpy;
                        })
                    };
                });
            });
            inject(function(_$compile_, _eventSetter_, _$rootScope_, _openTokPublisher_) {
                ot = _openTokPublisher_;
                es = _eventSetter_;
                $compile = _$compile_;
                rs = _$rootScope_;
                scope = rs.$new()
            });
            sessionCtrl = {
                getSession: function() {
                    return sessionSpy;
                },
                unpublish: jasmine.createSpy('unpublish'),
                isConnected: function() {
                    return true
                }
            };

            scope.targetProperties = {
                height: 300,
                width: 400
            };
            scope.myPublisher = {};
            scope.myEvents1 = {};
            scope.myEvents2 = {};
            elem = angular.element("<opentok-session><opentok-publisher onEvents='myEvents1' " +
                "onceEvents='myEvents2' props='targetProperties' publisher='myPublisher'></opentok-publisher></opentok-session>")
            elem.data({
                '$opentokSessionController': sessionCtrl
            });
            compiledElem(elem, scope);
        });

        function compiledElem(e, s, f) {
            if (f) sessionCtrl.isConnected = function() {
                false
            }
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
            it("should call init on publisher with element and properties object", function() {
                expect(ot.init.calls.argsFor(0)[0].localName).toEqual("opentok-publisher");
                expect(ot.init.calls.argsFor(0)[1]).toEqual({
                    height: 300,
                    width: 400
                });
            });
            it("should call 'eventSetter' with scope and 'publisher'", function() {
                expect(es.calls.argsFor(0)[1]).toEqual('publisher');
                expect(es.calls.argsFor(0)[0].publisher).toEqual(pubSpy);
                expect(es.calls.argsFor(0)[0].props()).toEqual(scope.targetProperties);
            });
        });
        describe('Scope Events', function() {
            describe('On destroy', function() {
                describe('when connected', function() {
                    it('should call unpublisher', function() {
                      

                    });
                });
            });
        });
    });
})();
