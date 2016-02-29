(function() {
    "use strict";


    angular.module("ngOpenTok.OTApi")
        .factory("OTApi", OTApiFactory);


    /** @ngInject */
    function OTApiFactory($q, $window, $log, OTAsyncLoader) {
        if (angular.isUndefined($window.OT)) {
            $log.info("Opentok Api is not available.  Attempting to load Api now");
            return OTAsyncLoader.load();
        }

        return $q.when($window.OT);
    }


})();
