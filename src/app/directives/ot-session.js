(function() {
    'use strict';

    angular.module('ngOpenTok.directives')
        .directive('openTokSession', openTokSessionDirective);

    function openTokSessionDirective() {

			return {
				restrict: 'AE',
				scope: {
					sessionId: '=id',
					subscribers: '=subscribers',
					publishers: '=publishers',
					events: '=events'
					// connection: '=',
					// capabilities: '='
				},
				template: "<div class='x-opentok-session'></div>"
			};


    }

})();
