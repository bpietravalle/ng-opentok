(function() {
    'use strict';

    /** @ngInject */
    function otStreamsFactory($q, otSubscriberModel, otutil) {

        return function(session, options) {
            return new StreamsModel($q, otSubscriberModel, otutil, session, options)
        };
    }

    function StreamsModel(q, subscriber, utils, session, options) {
        var children = [],
            self = this;
        self._options = options || {};
        self._q = q;
        self._subscriber = subscriber;
        self._utils = utils;
        self._autoSubscribe = self._utils.paramCheck(self._options.autoSubscribe, "bool", true);
        self.getSession = function() {
            return self._q.when(session);
        };
        self.getAll = function() {
            return children;
        };

    }

    StreamsModel.prototype.getSubscriber = getSubscriber;
    StreamsModel.prototype.getStream = getStream;
    StreamsModel.prototype.getRecord = getRecord;
    StreamsModel.prototype.add = add;
    StreamsModel.prototype.subscribe = subscribe;

    function subscribe(id, sub) {
        var self = this,
            stream = self.getStream(id, 'record');


        self._subscriber.init(sub)
            .then(function(res) {
                stream._subscriber = res;
            }).catch(function(err) {
                return self._utils.standardError(err);
            });

    }

    function getRecord(val, prop) {
        var self = this,
            idx = self._utils.findIndex(self.getAll(), prop, val);
        if (idx > -1) {
            return self.getAll()[idx];
        } else {
            throw new Error("No stream found with property " + prop + ": " + val);
        }

    }

    function getStream(val, prop) {
        if (!prop) prop = "id";
        var self = this,
            record = self.getRecord(val, prop);
        if (record) return record._child;
    }

    function getSubscriber(obj) {
        if (!prop) prop = "id";
        var self = this,
            record = self.getRecord(val, prop);
        if (record) return record._subscriber;
    }


    function add(obj) {
        var id = obj.streamId,
            self = this,
            newObj = {};
        newObj._child = obj;
        newObj.id = id;
        self.getAll().push(newObj);
    }


    angular.module('ngOpenTok.models.streams')
        .factory('otStreams', otStreamsFactory);

})();
