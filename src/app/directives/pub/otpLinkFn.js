// (function() {
//     'use strict';

//     angular.module('ngOpenTok.directives')
//         .factory('otpLinkFn', publisherLinkFn);

//     /** @ngInject */
//     function publisherLinkFn(eventSetter, openTokPublisher) {

//         return function(scope, element, a, ctrl) {
//             var props = scope.props() || {};
//             if (angular.isUndefined(scope.publisher)) scope.publisher = {};
//             scope.publisher = openTokPublisher.init(element[0], props);
//             eventSetter(scope, 'publisher');

//             scope.$on('$destroy', function() {
//                 // if (ctrl) ctrl.unpublish(scope.publisher);
//                 // else scope.publisher.destroy();
//             });

//         };

//     }

// })();
