(function() {
    'use strict';

    describe("opentokPublisher Directive", function() {
        var parent, $compile, sessionCtrl, rs, scope, ot, es, elem, pubSpy;

        beforeEach(function() {
            module('ngOpenTok.directives.publisher', function($provide) {
                $provide.factory('eventSetter', function($q) {
                    return jasmine.createSpy('eventSetter').and.callFake(function() {
                        return $q.when({});
                    });
                });

                $provide.factory('otPublisherModel', function($q) {
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
                                stream: {
                                    connection: {
                                        connectionId: 'myId'
                                    }
                                },

                                destroy: jasmine.createSpy('destroy')
                            };

                            return pubSpy;
                        })
                    };
                });
            });
            inject(function(_$compile_, _eventSetter_, _$rootScope_, _otPublisherModel_) {
                ot = _otPublisherModel_;
                es = _eventSetter_;
                $compile = _$compile_;
                rs = _$rootScope_;
                parent = rs.$new()
                scope = parent.$new()
            });
            sessionCtrl = {
                isConnected: function() {
                    return true
                },
                addPublisher: jasmine.createSpy('addPublisher'),
                remove: jasmine.createSpy('remove'),
                publish: jasmine.createSpy('publish'),
                unpublish: jasmine.createSpy('unpublish'),
                isLocal: function() {}
            };
            scope.targetProperties = {
                height: 300,
                width: 400
            };
            scope.myPublisher = {};
            scope.myEvents1 = {};
            scope.myEvents2 = {};
            elem = angular.element("<opentok-session><opentok-publisher onEvents='myEvents1' " +
                "onceEvents='myEvents2' props='targetProperties' publisher='myPublisher'></opentok-publisher></opentok-session>");
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
            it("should call init on publisher with element and properties object", function() {
                expect(ot.init.calls.argsFor(0)[0].localName).toEqual("opentok-publisher");
            });
            it("should call 'eventSetter' with scope and 'publisher'", function() {
                expect(es.calls.argsFor(0)[1]).toEqual('publisher');
                expect(es.calls.argsFor(0)[0].publisher).toEqual(pubSpy);
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
                    it('should call ctrl.unpublish', function() {
                        expect(sessionCtrl.unpublish).toHaveBeenCalledWith(pubSpy);
                    });
                    it('should not call publisher.destroy', function() {
                        expect(pubSpy.destroy).not.toHaveBeenCalled();
                    });
                });
                describe('when not local', function() {
                    beforeEach(function() {
                        elem = compiledElem(elem, scope);
                        pubSpy.stream = null;
                        scope.$broadcast('$destroy');
                        rs.$digest();
                    });
                    it('should not call ctrl.unpublisher', function() {
                        expect(sessionCtrl.unpublish).not.toHaveBeenCalled();
                    });
                    it('should call publisher.destroy', function() {
                        expect(pubSpy.destroy).toHaveBeenCalled();
                    });
                    it('should call ctrl.remove', function() {
                        var ctrl = sessionCtrl;
                        expect(ctrl.remove.calls.argsFor(0)[0]).toEqual('publishers');
                        expect(ctrl.remove.calls.argsFor(0)[1]).toEqual(pubSpy);
                    });
                });
            });
            describe("on 'sessionReady'", function() {
                it("should call 'addPublisher'", function() {
                    parent.$broadcast('sessionReady')
                    expect(sessionCtrl.addPublisher).toHaveBeenCalledWith(pubSpy);
                });


            });
        });
    });
})();
