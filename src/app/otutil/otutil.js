(function() {
    "use strict";


    angular.module("ngOpenTok.utils")
        .factory("otutil", otUtilsFactory);


    /** @ngInject */
    function otUtilsFactory($log, $q, lodash) {

        var utils = {
            handler: handler,
            defer: defer,
            extend: extend,
            findIndex: findIndex,
            keys: keys,
            paramCheck: paramCheck,
            qWrap: qWrap,
            qAll: qAll,
            eventHandler: eventHandler,
            standardError: standardError
        };

        return utils;

        function extend(dest, source) {
            return lodash.extend(dest, source);
        }

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

        function findIndex(obj, prop, val) {
            return lodash.findIndex(obj, function(item) {
                return item[prop] === val;
            });
        }

        function invalidType(type) {
            throw new Error("Invalid parameter type at: " + type);
        }

        function hashCheck(hash) {
            //TODO: iterate over keys and check for and remove unknowns
            return hash;
        }

        function keys(obj) {
            return Object.keys(obj);
        }

        function handler(fn, ctx) {
            return utils.defer(function(def) {
                fn.call(ctx, function(err, res) {
                    if (err !== null) {
                        def.reject(err);
                    } else {
                        def.resolve(res);
                    }
                });
            });
        }

        function defer(fn, ctx) {
            var def = $q.defer();
            fn.call(ctx, def);
            return def.promise;
        }

        /**
         * @param{Function} fn callback
         * @param{Object} [ctx] context
         */

        function eventHandler(fn, ctx) {
            return utils.defer(function(def) {
                fn.call(ctx, function(event) {
                    if (event) {
                        def.resolve(event);
                    } else {
                        def.reject("No event object returned");
                    }
                });
            });
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
