(function() {
    'use strict';
    describe('Streams Factory', function() {
        var rs, subject, subMock, test;

        beforeEach(function() {
            subMock = {};
            module('ngOpenTok.models', function($provide) {
                $provide.factory('otSubscriberModel', function($q) {
                    return {
                        init: jasmine.createSpy('init').and.callFake(function() {
                            return $q.when(subMock);
                        })
                    };
                });
            });

            inject(function(_$rootScope_, _otStreams_) {
                subject = _otStreams_;
                rs = _$rootScope_;
            });
            test = subject();
        });
        it('should be defined', function() {
            expect(subject).toBeDefined();
        });
        describe('getAll', function() {
            it('should return an array', function() {
                expect(test.getAll()).toBeAn('array');
            });
        });
        describe('add', function() {
            it('should add subscriber to children array', function() {
                test.add("string", {});
                expect(test.getAll()).toHaveLength(0)
                rs.$digest();
                expect(test.getAll()).toHaveLength(1)
                expect(test.getAll()[0].id).toEqual('string');
            });

        });


    });

})();
