(function() {
    "use strict";

    describe("otutil factory", function() {
        var $q, utils, $log, test;

        beforeEach(function() {
            module("ngOpenTok.utils");
            inject(function(_otutil_, _$log_, _$q_) {
                $log = _$log_;
                $q = _$q_;
                utils = _otutil_;
            });
            spyOn($log, "info");
            spyOn($q, "reject")
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
    });

})();
