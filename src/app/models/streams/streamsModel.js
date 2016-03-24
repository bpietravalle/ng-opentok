(function() {
    'use strict';

    /** @ngInject */
    function otStreamsFactory($q, otParent) {

        return function() {
            return new StreamsModel(otParent)
        };
    }

    function StreamsModel(base) {
        var self = this;
        return base({
            id: 'streamId',
            manager: 'subscriber'
        }).extend(self);
    }

    StreamsModel.prototype.getSubscriber = getSubscriber;
    StreamsModel.prototype.getStream = getStream;

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

    angular.module('ngOpenTok.models.streams')
        .factory('otStreams', otStreamsFactory);

})();
