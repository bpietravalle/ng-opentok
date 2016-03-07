(function() {
    'use strict';

    describe("opentokPublisher Directive", function() {
        var $compile, scope, ot, es, elem, pubSpy, handler;

        beforeEach(function() {
            handler = jasmine.createSpy('handler');
            module('ngOpenTok.directives', function($provide) {
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
                                once: promiseWrap('once')
                            };

                            return pubSpy;
                        })
                    };
                });
            });
            inject(function(_$compile_, _eventSetter_, $rootScope, _openTokPublisher_) {
                ot = _openTokPublisher_;
                es = _eventSetter_;
                $compile = _$compile_;
                scope = $rootScope.$new()
            });
            scope.targetProperties = {
                height: 300,
                width: 400
            };
            scope.myPublisher = {};
            scope.myEvents1 = {};
            scope.myEvents2 = {};

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
        describe('Without Required directive', function() {
            beforeEach(function() {
                elem = angular.element("<opentok-publisher onEvents='myEvents1' " +
                    "onceEvents='myEvents2' props='targetProperties' publisher='myPublisher'></opentok-publisher>")
                elem = compiledElem(elem, scope);

            });
            it("should be defined", function() {
                expect(elem.isolateScope()).toBeDefined();
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
        });
        describe('Without Required directive', function() {
            beforeEach(function() {
                elem = angular.element("<opentok-session <opentok-publisher onEvents='myEvents1' " +
                    "onceEvents='myEvents2' props='targetProperties' publisher='myPublisher'></opentok-publisher>")
                elem = compiledElem(elem, scope);

            });
        });
    });
})();
