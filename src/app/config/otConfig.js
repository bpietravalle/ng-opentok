(function() {
    'use strict';

    angular.module('ngOpenTok.config', [])
        .provider('otConfiguration', otConfigurationProvider);

    function otConfigurationProvider() {
        var self = this,
            options = {};
        /**
         * autoSubscribe
         * autoPublish
         *
         * @param{Object} opts
         * @param{Number} opts.apiKey - required
         * @param{Boolean} [opts.autoConnect] - connect to session on initialization - default === true
         * @param{Object} [opts.subscriber] - set default 'targetElement' (ie dom id) and 'targetProperties';
         * @param{Object} [opts.publisher] - set default 'targetElement' (ie dom id) and 'targetProperties';
         * other options see below
         */

        self.getOptions = function() {
            return options;
        };

        //default stream
        self.configure = function(opts) {
            angular.extend(options, opts);
        };

        self.$get = main;


        /** @ngInject */
        function main(otutil) {
            var options = self.getOptions();

            return {
                getSession: getSession,
                getSubscriber: getSubscriber,
                getPublisher: getPublisher
            }

            function getSession() {
                return options.session;
            }

            function getSubscriber() {
                return options.subscriber;
            }

            function getPublisher() {
                return options.publisher;
            }

            function checkConfig(obj) {

                // otutil.keys(

                // if (!options.apiKey) {
                // throw new Error("Please set apiKey during the config phase of your module");
                // }




            }

        }

    }
})();
