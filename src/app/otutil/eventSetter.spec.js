(function() {
    'use strict';

    describe('eventSetter factory', function() {
        var event, $q, rs, obj, subject;

        beforeEach(function() {
            module('ngOpenTok.utils')
            inject(function(_$q_, _$rootScope_, _eventSetter_) {
                subject = _eventSetter_;
                $q = _$q_;
                rs = _$rootScope_;
            });

            function promiseWrap(name, obj) {
                if (!obj) {
                    obj = {}
                }
                return jasmine.createSpy(name).and.callFake(function() {
                    return $q.when(obj);
                });
            }
            event = jasmine.createSpy('event');
            obj = {
                publisher: {
                    on: promiseWrap('on', event),
                    once: promiseWrap('once', event)
                }
            };
        });
        describe("When no scope property found", function() {
            it("should throw an error", function() {
                subject(obj).then(null, function(err) {
                    expect(err).toEqual("Invalid property: no scope property undefined found");
                });
                rs.$digest();
                subject(obj, "subscriber").then(null, function(err) {
                    expect(err).toEqual("Invalid property: no scope property subscriber found");
                });
                rs.$digest();
            });
        });
        describe("When no events are defined", function() {
            it("should return undefined", function() {
                subject(obj, 'publisher').then(function(res) {
                    expect(res).toBeAn('array');
                    expect(res.length).toEqual(2);
                    expect(res[0]).toBeUndefined();
                    expect(res[1]).toBeUndefined();
                }, function() {
                    expect(true).toEqual(false);
                });
                rs.$digest();
            });
        });
        describe("Adding Events", function() {
            var test, handler1 = jasmine.createSpy('handler1'),
                handler2 = jasmine.createSpy('handler2');
            beforeEach(function() {
                obj.onEvents = {
                    'event1': handler1
                };
                obj.onceEvents = {
                    'event2': handler2
                };
                test = subject(obj, 'publisher');
            });
            it("should call 'on' and 'once' with eventName", function() {
                test.then(function() {
                    expect(obj.publisher.on.calls.argsFor(0)[0]).toEqual('event1')
                    expect(obj.publisher.once.calls.argsFor(0)[0]).toEqual('event2')
                }, function() {
                    expect(true).toEqual(false);
                });
                rs.$digest();
            });
            it("should call handlers with scope and event obj", function() {
                test.then(function() {
                    expect(handler1).toHaveBeenCalledWith(obj, event);
                    expect(handler2).toHaveBeenCalledWith(obj, event);
                }, function() {
                    expect(true).toEqual(false);
                });
                rs.$digest();
            });




        });




    });
})();
