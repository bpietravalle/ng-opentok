(function() {
    "use strict";

    describe("OTApi factory", function() {
        var subject, $q, loader, $log;
        describe("When Api is still unavailable", function() {
            beforeEach(function() {
                module('ngOpenTok.OTApi', function($provide) {
                    $provide.factory('$log', function() {
                        return {
                            info: jasmine.createSpy('info')
                        }
                    });
                    $provide.factory('OTAsyncLoader', function($q) {
                        return {
                            load: jasmine.createSpy('load').and.returnValue($q.when({}))
                        }
                    });
                });
                inject(function(_OTApi_, _$log_, _OTAsyncLoader_) {
                    $log = _$log_;
                    subject = _OTApi_;
                    loader = _OTAsyncLoader_;
                });
            });
            it("should call AsyncLoader", function() {
                expect(loader.load).toHaveBeenCalled();
						});
						it("should call log.info",function(){
                expect($log.info.calls.argsFor(0)[0]).toEqual('Opentok Api is not available.  Attempting to load Api now')
            });
        });
        describe("When Api is defined", function() {
            beforeEach(function() {
                module('ngOpenTok.OTApi', function($provide) {
                    $provide.factory('$window', function() {
                        return {
                            OT: {
                                initSession: function() {}
                            }
                        };
                    });
                });
                inject(function(_$q_, _OTApi_) {
                    $q = _$q_;
                    subject = _OTApi_;
                });
            });
            it("should not throw an error", function() {
                expect(function() {
                    subject;

                }).not.toThrow();
            });
            it("should be a promise", function() {
                expect(subject).toBeAPromise();
            });
            it("should resolve to the OT object", function() {
                expect(subject).toEqual($q.when({
                    initSession: jasmine.any(Function)
                }));
            });
        });
    });

})();
