// (function() {
//     'use strict';

//     /** @ngInject */
//     function defaultEventsFactory($timeout) {
//         return function() {
//             var self = this;
//             self.on({
//                 'sessionDisconnected': function() {
//                     $timeout(function() {
//                         self.streams = {};
//                         self.connections = {};
//                     });
//                 },
//                 'streamDestroyed': function(event) {
//                     $timeout(function() {
//                         self.streams.remove(event.stream);
//                     });
//                 },
//                 'streamCreated': function(event) {
//                     $timeout(function() {
//                         self.streams.add(event.stream);
//                     });
//                 },
//                 'connectionCreated': function(event) {
//                     $timeout(function() {
//                         self.connections.add(event.connection);
//                     });
//                 },
//                 'connectionDestroyed': function(event) {
//                     $timeout(function() {
//                         self.connections.remove(event.connection);
//                     });
//                 }
//             })
//         }
//     }

//     angular.module('ngOpenTok.models.session')
//         .factory('defaultEvents', defaultEventsFactory)
// })();
