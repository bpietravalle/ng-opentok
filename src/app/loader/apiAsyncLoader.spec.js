(function() {
    // 'use strict';
    describe('apiAsyncLoaderOTProvider', function() {
        var $window, subject, url, rs;
        subject = null;
        beforeEach(function() {
            module('ngOpenTok.loader');
            inject(function(_$window_, _apiAsyncLoaderOT_, _$rootScope_) {
                subject = _apiAsyncLoaderOT_;
                $window = _$window_;
                rs = _$rootScope_;
            });
            url = '//static.opentok.com/v2/js/opentok.min.js';
            return $window.OT = void 0;
        });
        afterEach(function() {
            $window = null;
        });
        it("should be defined", function() {
            expect(subject).toBeDefined();
        });

        describe('#load', function() {
            var lastScriptIndex, options;
            afterAll(function() {
                return delete $window.navigator.connection;
            });
            it('should set the script', function() {
                subject.load(options);
                lastScriptIndex = $window.document.getElementsByTagName('script').length - 1;
                var script = $window.document.getElementsByTagName('script')[lastScriptIndex];
                expect(script.src).toContain(url);
                expect(script.type).toContain("text/javascript");
                expect(script.id).toContain("opentok_load_");
            });
            it("should create different ids", function() {
                subject.load(options);
                subject.load(options);
                lastScriptIndex = $window.document.getElementsByTagName('script').length - 1;
                var script1 = $window.document.getElementsByTagName('script')[lastScriptIndex];
                var script2 = $window.document.getElementsByTagName('script')[lastScriptIndex - 1];
                expect(script1.id).toContain("opentok_load_");
                expect(script2.id).toContain("opentok_load_");
                expect(script2.id).not.toEqual(script1.id);
            });
            it("should be a promise", function() {
                var test = subject.load();
                expect(test.then).toBeDefined();
            });
        });
    });
})();
