(function() {
    'use strict';

    function otutilFactory($q) {
        var utils = {
            //inspired by (ie stolen from) angularfire-seed repo
            handler: function(fn, res, ctx) {
                return utils.defer(function(def) {
                    fn.call(ctx, function(err) {
                        if (err !== null) {
                            return def.reject(err);
                        }
                        if (res && angular.isFunction(res)) {
                            return def.resolve(res.call(ctx));
                        }
                        return def.resolve(res);
                    });
                }, ctx);
            },

            defer: function(fn, ctx) {
                var def = $q.defer();
                fn.call(ctx, def);
                return def.promise;
            }

        };

        return utils;



    }

    angular.module('ngOpenTok')
        .factory('otutil', otutilFactory);
})();
