(function() {
    'use strict';
    describe('OpenTokSubscriber', function() {
        var subject;
        beforeEach(function() {
            module('ngOpenTok.models.subscriber', function($provide) {
                $provide.provider('OTAsyncLoader', function($q) {
                    return {
                        load: jasmine.createSpy('load').and.callFake(function() {
                            return $q.when({});
                        })
                    };
                });
            });
            inject(function(_OpenTokSubscriber_) {
                subject = _OpenTokSubscriber_;
            });
        });
        afterEach(function() {
            subject = null;
        });
        // it("should be defined", function() {
        //     expect(subject).toBeDefined();
        // });
    });
})();
