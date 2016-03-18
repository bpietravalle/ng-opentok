(function() {
    'use strict';

    /** @ngInject */
    function otStreamsFactory(otSubscriberModel) {

        return function(opts) {
            return new StreamsModel(otSubscriberModel, opts)
        };

    }

    function StreamsModel(subscriber, options) {
        var children = [];
        this._subscriber = subscriber;
        this._options = options;
        this.getAll = function() {
            return children;
        };
    }

    StreamsModel.prototype.add = function(id, obj) {
        var self = this;
        self._subscriber.init(obj)
            .then(function(res) {

                var newObj = {
                    id: id,
                    _child: res
                };
                self.getAll().push(newObj);
            });
    };


    // self.options = options;


    angular.module('ngOpenTok.models')
        .factory('otStreams', otStreamsFactory);

})();
