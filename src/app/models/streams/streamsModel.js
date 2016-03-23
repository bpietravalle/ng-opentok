(function() {
    'use strict';

    /** @ngInject */
    function otStreamsFactory($q, otParent, otSubscriberModel, otutil) {

        return function(session) {
            return new StreamsModel($q, otParent, otSubscriberModel, otutil, session)
        };
    }

    function StreamsModel(q, base, subscriber, utils, session) {
        var self = this;
        self._subscriber = subscriber;
        self._utils = utils;
        return base(session, {
            id: 'streamId',
            manager: 'subscriber'
        }).extend(self);
    }

    StreamsModel.prototype.getSubscriber = getSubscriber;
    StreamsModel.prototype.getStream = getStream;
    StreamsModel.prototype.subscribe = subscribe;

    function getSubscriber(key) {
        var self = this,
            rec = self.getRecord(key);
        return rec.subscriber;
    }

    function getStream(key) {
        var self = this,
            rec = self.getRecord(key);
        return rec.main;
    }

    function subscribe(id) {
        var self = this,
            stream = self.getStream(id);
        self.getSession()
            .then(function(res) {
                return res.subscribe(stream)
            }).then(function(sub) {
                self._subscriber.init(sub)
                    .then(function(res) {
                        self.addManager(id,res);
                    }).catch(function(err) {
                        return self._utils.standardError(err);
                    });
            });

    }

    // function getSubscriber(obj) {
    //     if (!prop) prop = "id";
    //     var self = this,
    //         record = self.getRecord(val, prop);
    //     if (record) return record._subscriber;
    // }


    angular.module('ngOpenTok.models.streams')
        .factory('otStreams', otStreamsFactory);

})();
