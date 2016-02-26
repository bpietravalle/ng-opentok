(function() {
    // 'use strict';
    describe('subjectProvider', function() {
        var subject, url, rs;
        subject = null;
        beforeEach(function() {
            // angular.module('mockModule', ['ngOpenTok']);
            module('ngOpenTok', function(otConfigurationProvider) {
                // otConfigurationProvider.configure({
                //     transport: "http"
                // });
                otConfigurationProvider.setApiKey("myApiKey");
                otConfigurationProvider.setParams("key", "another");
            });

            inject(function(_otConfiguration_, _$rootScope_) {
                subject = _otConfiguration_;
                rs = _$rootScope_;
            });
            url = '//static.opentok.com/v2/js/opentok.min.js';
            return window.OT = void 0;
        });
        afterEach(function() {
            window = null;
            document = null;
            if (window[OT]) {
                delete window[OT];
            }
        });
        it("should be defined", function() {
            expect(subject).toBeDefined();
        });
        describe("#setApiKey", function() {
            it("should set params.apiKey value", function() {
                expect(subject.getParams().apiKey).toEqual("myApiKey");
            });
        });
        describe("#setParams", function() {
            it("should set the params object", function() {
                expect(subject.getParams().key).toEqual("another");
            });
        });

        describe('#load', function() {
            var lastScriptIndex, options;
            afterAll(function() {
                return delete window.navigator.connection;
            });
            it('should set the script', function() {
                subject.load(options);
                lastScriptIndex = document.getElementsByTagName('script').length - 1;
                var script = document.getElementsByTagName('script')[lastScriptIndex];
                expect(script.src).toContain(url);
                expect(script.type).toContain("text/javascript");
                expect(script.id).toContain("opentok_load_");
            });
            it("should create different ids", function() {
                subject.load(options);
                subject.load(options);
                lastScriptIndex = document.getElementsByTagName('script').length - 1;
                var script1 = document.getElementsByTagName('script')[lastScriptIndex];
                var script2 = document.getElementsByTagName('script')[lastScriptIndex - 1];
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
