(function() {
    'use strict';
    describe('Child Model', function() {
        var subject, subMock, test;

        beforeEach(function() {
            subMock = {};
            module('ngOpenTok.models.streams', function($provide) {
                $provide.factory('otSubscriberModel', function($q) {
                    return {
                        init: jasmine.createSpy('init').and.callFake(function() {
                            return $q.when(subMock);
                        })
                    };
                });
            });

            inject(function(_otStreams_) {
                subject = _otStreams_;
            });
            test = subject();
        });
        afterEach(function() {
            subject = null;
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
            it('should use streamId property', function() {
                test.add({
                    stream: "obj",
                    streamId: "string"
                })
                expect(test.getAll()).toHaveLength(1)
                expect(test.getAll()[0].id).toEqual('string');
            });
        });
        describe('get', function() {
            beforeEach(function() {
                test.add({
                    streamId: "key1",
                    name: "a"
                });
                test.add({
                    streamId: "key2",
                    name: "b"
                });
                test.add({
                    streamId: "key3",
                    name: "c"
                })
            });
            describe("On Success", function() {
                it('should return "_child" property of correct obj', function() {

                    expect(test.getStream("key2")).toEqual({
                        streamId: "key2",
                        name: "b"
                    });

                });
            });
            describe("On Failure", function() {
                it('should throw error', function() {
                    expect(function() {
                        expect(test.getStream("key4")).toEqual({
                            name: "b"
                        });
                    }).toThrow();
                });
            });

        });


    });

})();
