(function() {
    'use strict';

    angular.module('ngOpenTok.models.publisher')
        .factory('otPublisherModel', otPublisherModelFactory);

    /** @ngInject */
    function otPublisherModelFactory($q, $timeout, OTApi, otutil, $log, otConfiguration) {

        return {
            init: init
        };

        /**
         * @constructor
         * @param{String|Object} [targetElement] - DOM id  or element for publisher
         * @param{Object} [props] - properties of publisher object
         * @description params should be defined during config phase
         */

        function init(targetElement, props) {
            return new OpenTokPublisher($q, $timeout, OTApi, otutil, $log, otConfiguration, targetElement, props);
        }

    }

    function OpenTokPublisher(q, timeout, api, utils, log, config, targetElement, props) {
        var self = this;
        self._q = q;
        self._timeout = timeout;
        self._api = api;
        self._utils = utils;
        self._log = log;
        self._options = config.getPublisher();
        if (angular.isString(targetElement)) {
            self._targetElement = self._utils.paramCheck(targetElement, "str", self._options.targetElement);
        } else {
            self._targetElement = self._utils.paramCheck(targetElement, "obj", self._options.targetElement);
        }
        self._props = self._utils.paramCheck(props, "obj", self._options.targetProperties);

        initPublisher(self._targetElement, self._props);

        function initPublisher(elem, props) {

            return getApi()
                .then(completeAction)
                .catch(standardError);

            function completeAction(res) {
                var methodsToExtend = ['on', 'once'];
                self._publisher = res.initPublisher(elem, props)
                var keys = Object.keys(self._publisher);

                self._q.all(keys.map(function(key) {
                    if (methodsToExtend.indexOf(key) === -1) {
                        self[key] = self._publisher[key];
                    }
                })).catch(standardError);
            }
        }

        function getApi() {
            return self._api;
        }

        function standardError(err) {
            return self._utils.standardError(err);
        }
    }

    OpenTokPublisher.prototype.on = on;
    OpenTokPublisher.prototype.once = once;
    OpenTokPublisher.prototype.inspect = inspect;

    /***************
     * Queries
     * ***********/

    function on(eventName, ctx) {
        var publisher = this._publisher;
        if (!ctx) ctx = publisher;
        return this._utils.eventHandler(function(cb) {
            return publisher.on(eventName, cb);
        }, ctx);
    }

    function once(eventName, ctx) {
        var publisher = this._publisher;
        if (!ctx) ctx = publisher;
        return this._utils.eventHandler(function(cb) {
            return publisher.once(eventName, cb);
        }, ctx);
    }

    function inspect(item) {
        switch (!item) {
            case true:
                return this;
            case false:
                item = "_" + item;
                return this[item];
        }
    }


}.call(this));
