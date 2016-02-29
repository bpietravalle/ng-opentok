(function() {
    'use strict';
    describe('OpenTokPublisher', function() {
        var subject;
        beforeEach(function() {
            module('ngOpenTok.models.publisher', function($provide) {
                $provide.provider('OTAsyncLoader', function($q) {
                    return {
                        load: jasmine.createSpy('load').and.callFake(function() {
                            return $q.when({});
                        })
                    };
                });
            });
            inject(function(_OpenTokPublisher_) {
                subject = _OpenTokPublisher_;
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
