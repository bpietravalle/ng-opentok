(function() {
    'use strict';

    describe("otutil factory", function() {
        var subject, test, rs, fnSpy, success, fail, def;

        beforeEach(function() {
            fnSpy = jasmine.createSpy('fnSpy');
            success = jasmine.createSpy('success');
            fail = jasmine.createSpy('fail');
            module('ngOpenTok');
            inject(function(_otutil_, $rootScope, $q) {
                subject = _otutil_;
                rs = $rootScope;
                def = $q.defer();
            });
        });
        it("should be defined", function() {
            expect(subject).toBeDefined();
        });

        describe("#defer", function() {
            beforeEach(function() {
                test = subject.defer(fnSpy, this);
            });
            it("should be a promise", function() {
                expect(test).toBeAPromise();
            });
            it("should call the passed parameter", function() {
                expect(fnSpy.calls.count()).toEqual(1);
            });
            it("should call the passed parameter", function() {
                expect(fnSpy.calls.count()).toEqual(1);
            });
            it("passed function should call a deferred obj", function() {
                expect(fnSpy.calls.argsFor(0)[0].promise).toBeAPromise();
                expect(fnSpy.calls.argsFor(0)[0].resolve).toBeA('function');
                expect(fnSpy.calls.argsFor(0)[0].reject).toBeA('function');
                expect(fnSpy.calls.argsFor(0)[0].notify).toBeA('function');
            });
            // it("will set success callback if set on context", function() {
            //     var scope = {};
            //     scope.success = success;
            //     test = subject.defer(fnSpy, scope);
            //     expect(fnSpy.calls.argsFor(1)[1]).toEqual(success);
            // });
        });
        describe("#handler", function() {
            describe("With success param set", function() {
                var scope, onResolved;
                beforeEach(function() {
                    scope = {};
                    onResolved = jasmine.createSpy('onResolved');
                    scope.success = function() {
                        return onResolved;
                    };
                    test = subject.handler(fnSpy, scope);
                });
                it("should work", function() {
                    test.then(success, fail);
                    rs.$digest();
                });
            });
            describe("When rejected", function() {
                it("should return error", function() {
                    function error() {
                        throw new Error("error");
                    }
                    expect(function() {
                        subject.handler(error);
                        rs.$digest();
                    }).toThrow();
                });
            });
            describe("When Resolved", function() {
                describe("With success function and ctx defined", function() {
                    it("should call function", function() {
                    });
                });
            });
        });
    });
})();
