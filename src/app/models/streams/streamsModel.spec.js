(function() {
    'use strict';
    describe('Streams Factory', function() {
        var otSub, to, rs, subject, otStreams, sessionMock, subMock;

        beforeEach(function() {
            subMock = {
                id: "submockid",
                name: "submock"
            }
            sessionMock = {
                subscribe: jasmine.createSpy('subscribe').and.callFake(function() {
                    return subMock;
                }),
                id: "session"
            }
            module('ngOpenTok.models.streams', function($provide) {
                $provide.factory('otSubscriberModel', function($q) {
                    return {
                        init: jasmine.createSpy('init').and.callFake(function(arg) {
                            arg.name = "otSubscriberModel";
                            return $q.when(arg);
                        })
                    };
                });
            });

            inject(function(_otSubscriberModel_, $timeout, $rootScope, _otStreams_) {
                otStreams = _otStreams_;
                otSub = _otSubscriberModel_;
                rs = $rootScope;
                to = $timeout;
            });
            subject = otStreams(sessionMock);
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
            expect(subject.subscribe).toBeDefined();
        });
        describe("subscribe", function() {
            beforeEach(function() {
                subject.subscribe('key1');
                rs.$digest();
            });
            it("should call session.subscribe with stream object", function() {
                expect(sessionMock.subscribe).toHaveBeenCalledWith({
                    streamId: 'key1',
                    name: 'a'
                });
            });
            it("should call subscriber.init with sub obj returned from session", function() {
                expect(otSub.init).toHaveBeenCalledWith(subMock);
            });
            it("should add subscriber obj to record", function() {
                var rec = subject.getRecord('key1');
                expect(rec.subscriber).toEqual(subMock);
                expect(rec.subscriber.name).toEqual('otSubscriberModel');
            });
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
                subject.subscribe('key1');
                rs.$digest();
                expect(subject.getSubscriber('key1')).toEqual(subMock);
            });
        });
    });

})();
