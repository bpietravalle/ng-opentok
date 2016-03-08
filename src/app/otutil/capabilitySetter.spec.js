(function() {
    'use strict';

    describe('capabilitySetter factory', function() {
        var scope, subject;

        beforeEach(function() {
            module('ngOpenTok.utils')
            inject(function(_capabilitySetter_) {
                subject = _capabilitySetter_;
            });
        });

        function setCaps(a, b, c, d) {
            var meths = ['subscribe', 'unsubscribe', 'publish', 'unpublish', 'forceDisconnect', 'forceUnpublish'];
            scope = {
                session: {
                    connection: {
                        connectionId: 'string',
                        capabilities: {
                            forceDisconnect: a,
                            forceUnpublish: b,
                            publish: c,
                            subscribe: d
                        }
                    }
                }
            };

            function addMeth(y) {
                scope.session[y] = jasmine.createSpy(y);
            }
            meths.forEach(addMeth);
            return scope;
        }
        describe('When value is undefined', function() {
            it("should throw error", function() {
                scope = setCaps(1, 2, 3, undefined);
                subject(scope).then(null, function(err) {
                    expect(err).toBeDefined();
                });
            });
        });
        describe('When sum equals 1', function() {
            beforeEach(function() {
                setCaps(0, 0, 0, 1);
                subject(scope);
            });
            var m = ['subscribe', 'unsubscribe'];
            m.forEach(checkMeth);
        });
        describe('When sum equals 2', function() {
            beforeEach(function() {
                setCaps(0, 0, 1, 1);
                subject(scope);
            });
            var m = ['subscribe', 'unsubscribe', 'publish', 'unpublish'];
            m.forEach(checkMeth);
        });
        describe('When sum equals 4', function() {
            beforeEach(function() {
                setCaps(1, 1, 1, 1);
                subject(scope);
            });
            var m = ['forceDisconnect', 'forceUnpublish', 'subscribe', 'unsubscribe', 'publish', 'unpublish'];
            m.forEach(checkMeth);
        });

        function checkMeth(y) {
            it("should add " + y + " to scope obj", function() {
                expect(scope[y]).toBeDefined();
            });
            it("should call session." + y + "() when called", function() {
                scope[y]();
                expect(scope.session[y]).toHaveBeenCalled();
            });

        }

    });
})();
