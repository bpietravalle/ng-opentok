(function() {
    'use strict';
    describe('OpenTokSubscriber', function() {
        var subject, rs, subscriberSpy;
        afterEach(function() {
            subject = null;
        });
        beforeEach(function() {
            subscriberSpy = {
                element: "element",
                id: "id",
                stream: {
                    stream: "obj"
                },
                on: jasmine.createSpy('on'),
                once: jasmine.createSpy('once'),
                getStats: jasmine.createSpy('getStats')
            };
        });
        describe("Configured Setup - in module's config phase", function() {
            // beforeEach(function() {
            //     module('ngOpenTok.models.subscriber', function($provide, OpenTokSubscriberProvider) {
            //         $provide.factory('OTApi', function($q) {
            //             return $q.when(ApiSpy);
            //         });
            //         OpenTokSubscriberProvider.configure({
            //             targetElement: "different",
            //             props: {
            //                 different: "props"
            //             }
            //         });
            //     });
            //     inject(function(_$rootScope_, _OpenTokSubscriber_) {
            //         subject = _OpenTokSubscriber_;
            //         rs = _$rootScope_;
            //     });
            // });
            // afterEach(function() {
            //     subject = null;
            // });
            // describe("With no args passed to Ctor", function() {
            //     beforeEach(function() {
            //         subject();
            //         rs.$digest();
            //     });
            //     it("should not call initSubscriber with defaults", function() {
            //         expect(ApiSpy.initSubscriber).not.toHaveBeenCalledWith("subscriberContainer", {
            //             height: 300,
            //             width: 400
            //         });
            //     });
            //     it("should pass specified options to initSubscriber", function() {
            //         expect(ApiSpy.initSubscriber.calls.argsFor(0)[0]).toEqual("different");
            //         expect(ApiSpy.initSubscriber.calls.argsFor(0)[1]).toEqual({
            //             different: "props"
            //         });
            //     });
            // });
            // describe("With passing args to Ctor", function() {
            //     beforeEach(function() {
            //         subject("evenMoreDifferent", {
            //             veryDifferent: "props"
            //         });
            //         rs.$digest();
            //     });
            //     it("should not call initSubscriber with defaults", function() {
            //         expect(ApiSpy.initSubscriber).not.toHaveBeenCalledWith("subscriberContainer", {
            //             height: 300,
            //             width: 400
            //         });
            //     });
            //     it("should not pass preset options to initSubscriber", function() {
            //         expect(ApiSpy.initSubscriber).not.toHaveBeenCalledWith("different", {
            //             different: "props"
            //         });
            //     });
            //     it("should pass specified options to initSubscriber", function() {
            //         expect(ApiSpy.initSubscriber.calls.argsFor(0)[0]).toEqual("evenMoreDifferent");
            //         expect(ApiSpy.initSubscriber.calls.argsFor(0)[1]).toEqual({
            //             veryDifferent: "props"
            //         });
            //     });
            // });
        });
        describe("Default configuration", function() {
            // beforeEach(function() {
            //     module('ngOpenTok.models.subscriber', function($provide) {
            //         $provide.factory('OTApi', function($q) {
            //             return $q.when(ApiSpy);
            //         });
            //     });
            //     inject(function(_$rootScope_, _OpenTokSubscriber_) {
            //         subject = _OpenTokSubscriber_;
            //         rs = _$rootScope_;
            //     });
            // });
            // afterEach(function() {
            //     subject = null;
            // });
            // it("should pass default args to initSubscriber", function() {
            //     subject();
            //     rs.$digest();
            //     expect(ApiSpy.initSubscriber.calls.argsFor(0)[0]).toEqual("subscriberContainer");
            //     expect(ApiSpy.initSubscriber.calls.argsFor(0)[1]).toEqual({
            //         height: 300,
            //         width: 400
            //     });
            // });
        });
        describe("With Valid configuration", function() {
            beforeEach(function() {
                module('ngOpenTok.models.subscriber');
                inject(function(_OpenTokSubscriber_, _$rootScope_) {
                    rs = _$rootScope_;
                    subject = _OpenTokSubscriber_(subscriberSpy);
                });
                rs.$digest();

            });
            afterEach(function() {
                subject = null;
            });
            it("should be defined", function() {
                expect(subject).toBeDefined();
            });
            describe("inspect", function() {
                // var test;
                describe("without arguments", function() {
                    // it("should return the 'self' object", function() {
                    //     test = subject.inspect();
                    //     expect(test).toEqual(jasmine.objectContaining({
                    //         _timeout: jasmine.any(Function),
                    //         _injector: jasmine.any(Object),
                    //         _options: jasmine.any(Object)
                    //     }));
                    // });
                });
                describe("when passing an argument", function() {
                    // it("should only return the specific property of the self obj", function() {
                    //     test = subject.inspect("timeout");
                    //     expect(test).toBeA('function');
                    //     test = subject.inspect("options");
                    //     expect(test).toBeAn('object');
                    // });
                });
            });
            describe("properties", function() {
                var props = ['element', 'id', 'stream'];

                function testProps(y) {
                    describe(y, function() {
                        it("should have a " + y + " property", function() {
                            expect(subject[y]).toBeDefined();
                        });
                    });
                }
                props.forEach(testProps);
            });
            describe("Queries", function() {
                // var ctx = {
                //     context: "of fn call"
                // };
                // var queries = [
                //     ['on', ['onEventName']],
                //     ['on', ['onEventName', ctx]],
                //     ['once', ['onceEventName']],
                //     ['once', ['onceEventName', ctx]]
                // ];

                // function testQueries(y) {
                //     describe(y[0], function() {
                //         var fn, spy, utils;
                //         beforeEach(function() {
                //             rs.$digest();
                //             utils = subject.inspect('utils');
                //             spyOn(utils, 'handler').and.callThrough();
                //             subject[y[0]].apply(subject, y[1]);
                //             rs.$digest();
                //             spy = subject.inspect('subscriber');
                //             fn = jasmine.any(Function);
                //         });
                //         it("should pass params to OT api", function() {
                //             expect(spy[y[0]].calls.argsFor(0)[0]).toEqual(y[1][0]);
                //             expect(spy[y[0]].calls.argsFor(0)[1]).toEqual(fn);
                //         });
                //         if (y[1].length === 1) {
                //             describe("Context - if ctx arg is undefined", function() {
                //                 it("should set context to the current subscriber object", function() {
                //                     expect(utils.eventHandler.calls.argsFor(0)[1]).toEqual(spy);
                //                 });
                //             });
                //         } else {
                //             describe("Context - if ctx arg is defined", function() {
                //                 it("should pass arg to the current subscriber object", function() {
                //                     expect(utils.eventHandler.calls.argsFor(0)[1]).toEqual(ctx);
                //                 });
                //             });
                //         }
                //     });
                // }
                // queries.forEach(testQueries);
            });
        });
    });
})();
