(function() {
    'use strict';

    angular.module('ngOpenTok')
        .directive('otSession', otSessionDirective);

    function otSessionDirective() {

			return {
				restrict: 'AE',
				scope: {
					sessionId: '@',
					// connection: '=',
					// capabilities: '='
				},
				template: "<div class='angular-ot-session'>{{sessionId}}</div>"
			};


    }

})();
