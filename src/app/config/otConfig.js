(function() {
    'use strict';

    angular.module('ngOpenTok.config', [])
        .provider('otConfiguration', otConfigurationProvider);

    function otConfigurationProvider() {
        var self = this,
            options = {};

        self.getOptions = function() {
            return options;
        };

        //default stream
        self.configure = function(opts) {
            angular.extend(options, opts);
        };

        self.$get = main;


        function main() {
            var options = self.getOptions();

            return options;

        }

    }
})();
