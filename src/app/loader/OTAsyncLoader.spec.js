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
                    $window = null;
                });
                it("should be defined", function() {
                    expect(subject).toBeDefined();
                });
                // describe("random fn on window", function() {
                //     var keys, arr;
                //     beforeEach(function() {
                //         subject.load();
                //         keys = Object.keys($window),
                //             arr = [];

                //         function matchVal(y) {
                //             if (y.match('onOpenTokReady')) {
                //                 arr.push(y);
                //             }
                //         }
                //         keys.forEach(matchVal)
                //     });
                //     it("shoudl construct a function on window", function() {
                //         expect(arr.length).toBeGreaterThan(0);
                //     });
                //     it("should remove fn after calling", function() {
                //         $window[arr[0]]()
                //         expect($window[arr[0]]).toEqual(null);
                //     });
                // });

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
                        expect(script.onload).toBeA('function');
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
