(function() {
    "use strict";

    describe("otutil factory", function() {
        var $q, rs, utils, $log, test;

        beforeEach(function() {
            module("ngOpenTok.utils");
            inject(function(_otutil_, _$log_, _$q_, $rootScope) {
                $log = _$log_;
                $q = _$q_;
                rs = $rootScope;
                utils = _otutil_;
            });
            spyOn($log, "info");
            spyOn($q, "reject")
        });
        describe("extend", function() {
            var source, dest;
            beforeEach(function() {
                source = {
                    first_name: "bob",
                    getName: function() {
                        return source.first_name;
                    }
                };
                dest = {};
            });
            it("should work", function() {
                utils.extend(dest, source)
                expect(dest.getName()).toEqual("bob");
            });
        });

        describe("findIndex", function() {
            var arr;
            beforeEach(function() {
                arr = [{
                    id: 1,
                    name: "bob"
                }, {
                    id: 2,
                    name: "bill"
                }, {
                    id: 3,
                    name: "blah"
                }];
            });
            it("should return correct idx", function() {
                test = utils.findIndex(arr, 'name', 'blah');
                expect(test).toEqual(2);
            });
            it("should return -1 if record isn't available", function() {
                test = utils.findIndex(arr, 'id', 4);
                expect(test).toEqual(-1);
            });
        });
        describe("paramCheck", function() {
            it("should return default if param arg is undefined", function() {
                test = utils.paramCheck(undefined, "str", "default");
                expect(test).toEqual("default");
            });

            var params = [
                ["str", "aString", 12312, "string"],
                ["bool", true, {}, "boolean"],
                ["arr", ["array", "of", "data"], true, "array"]
            ];

            function paramCheck(y) {
                it("should return param if it is a " + y[3], function() {
                    test = utils.paramCheck(y[1], y[0], "default");
                    expect(test).toEqual(y[1]);
                });
                it("should call $q.reject if param is not a " + y[3], function() {
                    expect(function() {
                        utils.paramCheck(y[2], y[0], "default");
                    }).toThrow();
                    // expect($q.reject).toHaveBeenCalled();
                });
            }
            params.forEach(paramCheck);
        });

        describe("standardError", function() {
            it("should call $q.reject with error message", function() {
                utils.standardError("error");
                expect($q.reject).toHaveBeenCalledWith("error");
            });
        });
        describe("Promise Handlers", function() {
            var spy, val, success, fail, ctx;
            beforeEach(function() {
                success = jasmine.createSpy('success');
                fail = jasmine.createSpy('fail');
                ctx = {};
            });
            describe("eventHandler", function() {
                describe("When Resolved", function() {
                    beforeEach(function() {
                        spy = jasmine.createSpy('spy').and.callFake(function(event) {
                            return event("event");
                        });
                        test = utils.eventHandler(spy, ctx)
                        test.then(function(res) {
                            val = res;
                        }, fail);
                        rs.$digest();
                    });
                    it("should set return value to the event object", function() {
                        expect(val).toEqual("event")
                    });
                    it("should not call error callback", function() {
                        expect(fail).not.toHaveBeenCalled();
                    });
                });
                describe("When Rejected", function() {
                    beforeEach(function() {
                        spy = jasmine.createSpy('spy').and.callFake(function(event) {
                            return event(null);
                        });
                        test = utils.eventHandler(spy, ctx)
                        test.then(success, function(err) {
                            val = err
                        });
                        rs.$digest();
                    });
                    it("should set return value to the event object", function() {
                        expect(val).toEqual("No event object returned")
                    });
                    it("should not call success callback", function() {
                        expect(success).not.toHaveBeenCalled();
                    });
                });
            });
            describe("handler", function() {
                describe("When Resolved", function() {
                    beforeEach(function() {
                        spy = jasmine.createSpy('spy').and.callFake(function(err) {
                            return err(null);
                            // return result;
                        });
                        test = utils.handler(spy, ctx)
                        test.then(function(res) {
                            val = res;
                        }, fail);
                        rs.$digest();
                    });
                    it("should set return value to undefined", function() {
                        expect(val).toEqual(undefined)
                    });
                    it("should not call error callback", function() {
                        expect(fail).not.toHaveBeenCalled();
                    });
                });
                describe("When Rejected", function() {
                    beforeEach(function() {
                        spy = jasmine.createSpy('spy').and.callFake(function(err) {
                            return err("error with request");
                        });
                        test = utils.handler(spy, ctx)
                        test.then(success, function(err) {
                            val = err
                        });
                        rs.$digest();
                    });
                    it("should set return value to the error object", function() {
                        expect(val).toEqual("error with request")
                    });
                    it("should not call success callback", function() {
                        expect(success).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });

})();
