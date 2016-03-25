(function() {
    'use strict';

    describe("opentokSubscriber Directive", function() {
        var ctrl, parent, streams, $compile, sessionCtrl, rs, sessionSpy, scope, elem, subSpy;

        beforeEach(function() {
            streams = [{
                id: 1,
                name: 'a'
            }, {
                id: 2,
                name: 'b'
            }, {
                id: 3,
                name: 'c'
            }];
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
                getStreams: jasmine.createSpy('getStreams').and.callFake(function() {
                    return streams;
                }),

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
            elem = angular.element("<opentok-session>" +
                "<opentok-subscribers streams='getStreams' events='myEvents1' " +
                "></opentok-subscribers>" +
                "</opentok-session>");
            elem.data({
                '$opentokSessionController': sessionCtrl
            });
            compiledElem(elem, scope);
            parent.$broadcast('sessionReady');
            ctrl = elem.controller('opentokSubscribers')
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
            expect(ctrl.streams()).toEqual(streams);
            // expect(elem.isolateScope()).toEqual(streams);
        });
    });
})();
