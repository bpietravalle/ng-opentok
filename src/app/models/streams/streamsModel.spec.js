(function() {
    'use strict';
    describe('Streams Factory', function() {
        var to, rs, subject, otStreams, subMock;

        beforeEach(function() {
            subMock = {
                id: "submockid",
                name: "submock"
            }
            module('ngOpenTok.models.streams');

            inject(function($timeout, $rootScope, _otStreams_) {
                otStreams = _otStreams_;
                rs = $rootScope;
                to = $timeout;
            });
            subject = otStreams();
            subject.add({
                streamId: "key1",
                name: "a"
            });
            subject.add({
                streamId: "key2",
                name: "b"
            });
            to.flush();

        });
        afterEach(function() {
            subject = null;
        });
        it('should be defined', function() {
            expect(subject).toBeDefined();
        });
        describe("getStream", function() {
            it("should return record's 'main' property", function() {
                expect(subject.getStream('key1')).toEqual({
                    streamId: 'key1',
                    name: 'a'
                });
            });
        });
        describe("getSubscriber", function() {
            it("should return record's 'manager' property", function() {
                subject.getRecord('key1').subscriber = subMock;
                rs.$digest();
                expect(subject.getSubscriber('key1')).toEqual(subMock);
            });
        });
    });

})();
