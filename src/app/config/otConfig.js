(function() {
    'use strict';

    angular.module('ngOpenTok.config', ['ngOpenTok.utils'])
        .provider('otConfiguration', otConfigurationProvider);

    function otConfigurationProvider() {
        var self = this,
            options = {};
        /**
         * autoSubscribe
         * autoPublish
         *
         * @param{Object} opts
         * @param{Object} opts.session - required
         * @param{Number} opts.session.apiKey - required
         * @param{Boolean} [opts.session.autoConnect] - connect to session on initialization - default === true
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
            checkConfig(options);

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

                obj.session = otutil.paramCheck(obj.session, "obj", {});
                obj.subscriber = otutil.paramCheck(obj.subscriber, "obj", {});
                obj.publisher = otutil.paramCheck(obj.publisher, "obj", {});
                if (obj.apiKey) {
                    obj.session.apiKey = obj.apiKey;
                }
                if (!obj.session.apiKey) {
                    throw new Error("Please set apiKey during the config phase of your module");
                }
                obj.session.autoConnect = otutil.paramCheck(obj.session.autoConnect, 'bool', true);
                obj.session.autoPublish = otutil.paramCheck(obj.session.autoPublish, 'bool', true);
                obj.session.autoSubscribe = otutil.paramCheck(obj.session.autoSubscribe, 'bool', true);
                obj.session.addDefaultEvents = otutil.paramCheck(obj.session.addDefaultEvents, 'bool', true);
            }

        }

    }
})();
