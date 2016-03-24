(function() {
    'use strict';

    /** @ngInject */
    function otParentFactory($q, $timeout, otutil) {

        return function(options) {
            return new ParentModel($q, $timeout, otutil, options)
        };
    }

    function ParentModel(q, timeout, utils, options) {
        var children = {},
            self = this;
        self._q = q;
        self._timeout = timeout;
        self._utils = utils;
        self._options = options || {};
        self._childKey = self._utils.paramCheck(self._options.id, "str", "id");
        self._manager = self._utils.paramCheck(self._options.manager, "str", "manager");
        self.getAll = function() {
            return children;
        };

    }

    ParentModel.prototype.extend = extend;
    ParentModel.prototype.keys = keys;
    ParentModel.prototype.getRecord = getRecord;
    ParentModel.prototype.add = add;
    ParentModel.prototype.remove = remove;
    ParentModel.prototype.addManager = addManager;

    function getRecord(key) {
        var self = this;
        key = checkKey(key, self._childKey);
        return self.getAll()[key];
    }

    function addManager(id, obj) {
        var self = this,
            rec = self.getRecord(id);
        rec[self._manager] = obj;
    }

    function keys() {
        var self = this;
        return self._utils.keys(self.getAll());
    }


    function remove(key) {
        var self = this;
        self._timeout(function() {
            key = checkKey(key, self._childKey);
            delete self.getAll()[key];
        });
    }

    function add(obj) {
        var self = this,
            id = obj[self._childKey],
            newObj = {};
        self._timeout(function() {
            if (angular.isUndefined(id)) {
                throw new Error("No " + self._childKey + " property found for: " + id);
            }
            newObj[id] = {
                main: obj
            }
            angular.extend(self.getAll(), newObj);
        });
    }

    function extend(obj) {
        var self = this;
        return self._utils.extend(obj, self);
    }

    function checkKey(str, def) {
        switch (angular.isString(str)) {
            case true:
                return str;
            default:
                switch (angular.isObject(str)) {
                    case true:
                        if (angular.isDefined(str[def])) {
                            return str[def];
                        }
                        if (angular.isDefined(str['main'][def])) {
                            return str['main'][def];
                        }
                        break;
                    default:
                        throw new Error("No record found for key: " + str);
                }
        }
    }


    angular.module('ngOpenTok.models.base')
        .factory('otParent', otParentFactory);

})();
