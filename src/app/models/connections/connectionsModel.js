(function() {
    'use strict';

    /** @ngInject */
    function otConnectionsFactory(otParent) {

        return function() {
            return new ConnectionsModel(otParent)
        };
    }

    function ConnectionsModel(base) {
        var self = this;
        return base({
            id: 'connectionId'
        }).extend(self);
    }

    ConnectionsModel.prototype.getConnection = getConnection;

    function getConnection(key) {
        var self = this,
            rec = self.getRecord(key);
        return rec.main;
    }

    angular.module('ngOpenTok.models.connections')
        .factory('otConnections', otConnectionsFactory);

})();
