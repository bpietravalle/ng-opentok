(function() {
    'use strict';
    describe('Connections Factory', function() {
        var to, subject, otConnections;

        beforeEach(function() {
            module('ngOpenTok.models.connections');

            inject(function($timeout, _otConnections_) {
                otConnections = _otConnections_;
                to = $timeout;
            });
            subject = otConnections();
            subject.add({
                connectionId: "key1",
                name: "a"
            });
            subject.add({
                connectionId: "key2",
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
                expect(subject.getConnection('key1')).toEqual({
                    connectionId: 'key1',
                    name: 'a'
                });
            });
        });
    });

})();
