(function() {
    "use strict";


    angular.module("ngOpenTok.utils")
        .factory("otutil", otUtilsFactory);


    /** @ngInject */
    function otUtilsFactory($log, $q) {

        var utils = {
            handler: handler,
            defer: defer,
            paramCheck: paramCheck,
            qWrap: qWrap,
            qAll: qAll,
            standardError: standardError
        };

        return utils;

        function paramCheck(param, type, def) {
            switch (angular.isUndefined(param)) {
                case true:
                    return def;
                case false:
                    switch (type) {
                        case "bool":
                            return boolCheck(param);
                        case "str":
                            return strCheck(param);
                        case "arr":
                            return arrCheck(param);
                        case "obj":
                            return hashCheck(param);
                    }
                    break;
            }
        }

        function strCheck(str) {
            switch (angular.isString(str)) {
                case true:
                    return str;
                case false:
                    return invalidType(str);
            }
        }

        function arrCheck(arr) {
            switch (angular.isArray(arr)) {
                case true:
                    return arr;
                case false:
                    return invalidType(arr);
            }
        }

        function boolCheck(bool) {
            var accepted = [false, true];
            switch (accepted.indexOf(bool)) {
                case -1:
                    return invalidType(bool);
                default:
                    return bool;
            }
        }

        function invalidType(type) {
            throw new Error("Invalid parameter type at: " + type);
        }

        function hashCheck(hash) {
            //TODO: iterate over keys and check for and remove unknowns
            return hash;
        }

        function handler(fn, res, ctx) {
            return utils.defer(function(def) {
                fn.call(ctx, function(err, result) {
                    if (err !== null) {
                        return def.reject(err);
                    }
                    if (result) {
                        return def.resolve(result);
                    }
                    if (res && angular.isFunction(res)) {
                        return def.resolve(res.call(ctx));
                    }
                    return def.resolve(res);
                });
            }, ctx);
        }

        function defer(fn, ctx) {
            var def = $q.defer();
            fn.call(ctx, def);
            return def.promise;
        }


        function qWrap(obj) {
            return $q.when(obj);
        }

        function qAll(x, y) {
            return $q.all([x, qWrap(y)]);
        }

        function standardError(err) {
            return $q.reject(err);
        }

    }



})();
