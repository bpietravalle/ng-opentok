(function() {
    'use strict';
    describe('OTAsyncLoaderProvider', function() {
        var $window, subject, url;
        subject = null;
        describe("With configured options", function() {
            beforeEach(function() {
                module('ngOpenTok.loader', function(OTAsyncLoaderProvider) {
                    OTAsyncLoaderProvider.configure({
                        transport: "auto"
                    });
                });
                inject(function(_$window_, _OTAsyncLoader_) {
                    subject = _OTAsyncLoader_;
                    $window = _$window_;
                });
                url = '//static.opentok.com/v2/js/opentok.min.js';
            });
            afterEach(function() {
                $window = null;
                subject = null;
            });
            it("should be defined", function() {
                expect(subject).toBeDefined();
            });
            it('should set the script', function() {
                subject.load();
                var lastScriptIndex = $window.document.getElementsByTagName('script').length - 1;
                var script = $window.document.getElementsByTagName('script')[lastScriptIndex];
                expect(script.src).toContain(url);
                expect(script.src).not.toContain('https');
                expect(script.onload).toBeA('function');
            });
        });
        describe("Defaults", function() {
            describe("With OT object undefined", function() {
                beforeEach(function() {
                    module('ngOpenTok.loader');
                    inject(function(_$window_, _OTAsyncLoader_) {
                        subject = _OTAsyncLoader_;
                        $window = _$window_;
                    });
                    url = '//static.opentok.com/v2/js/opentok.min.js';
                    $window.OT = undefined;
                });
                afterEach(function() {
                    subject = null;
                    $window = null;
                });
                it("should be defined", function() {
                    expect(subject).toBeDefined();
                });
            });
            describe("With OT object defined", function() {
                beforeEach(function() {
                    module('ngOpenTok.loader');
                    inject(function(_$window_, _OTAsyncLoader_) {
                        subject = _OTAsyncLoader_;
                        $window = _$window_;
                    });
                    url = '//static.opentok.com/v2/js/opentok.min.js';
                    $window.OT = {};
                });
                afterEach(function() {
                    subject = null;
                    $window = null;
                });
                it("should be defined", function() {
                    expect(subject).toBeDefined();
                });
                describe('#load', function() {
                    var lastScriptIndex, options;
                    afterAll(function() {
                        delete $window.navigator.connection;
                    });
                    it('should set the script', function() {
                        subject.load(options);
                        lastScriptIndex = $window.document.getElementsByTagName('script').length - 1;
                        var script = $window.document.getElementsByTagName('script')[lastScriptIndex];
                        expect(script.src).toContain(url);
                        expect(script.type).toContain("text/javascript");
                        expect(script.id).toContain("opentok_load_");
                    });
                    it("should be a promise", function() {
                        var test = subject.load();
                        expect(test.then).toBeDefined();
                    });
                    it("should not define global", function() {
                        expect($window['openTok']).not.toBeDefined();
                    });
                });
            });
        });
    });
})();
