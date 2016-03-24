(function() {
    'use strict';
    describe('Parent Model', function() {
        var to, subject, rs, otParent;

        beforeEach(function() {
            module('ngOpenTok.models.base');
            inject(function(_$timeout_, _otParent_, $rootScope) {
                otParent = _otParent_;
                to = _$timeout_;
                rs = $rootScope;
            });
            subject = otParent({
                id: "streamId",
                manager: "subscriber"
            });
            subject.add({
                streamId: "key1",
                name: "a"
            });
            subject.add({
                streamId: "key2",
                name: "b"
            });
            subject.add({
                streamId: "key3",
                name: "c"
            })
            to.flush();
        });
        afterEach(function() {
            subject = null;
        });
        it('should be defined', function() {
            expect(subject).toBeDefined();
        });
        describe("Queries", function() {
            describe("keys", function() {
                it("should return an array", function() {
                    expect(subject.keys()).toEqual(["key1", "key2", "key3"]);
                });
            });
            describe('getAll', function() {
                it('should return an object', function() {
                    expect(subject.getAll()).toBeAn('object');
                });
            });
            describe('getRecord', function() {
                describe("With valid key", function() {
                    it("should return correct record", function() {
                        expect(subject.getRecord('key1')).toEqual({
                            main: {
                                streamId: 'key1',
                                name: 'a'
                            }
                        });
                    });
                });
                describe("With Invalid key", function() {
                    it("should be undefined", function() {
                        expect(subject.getRecord('invalidKey')).not.toBeDefined();
                    });
                });
            });
        });
        describe("Commands", function() {
            describe('addManager', function() {
                it("should add property to object", function() {
                    var subMock = {
                        id: "subscriber"
                    };
                    subject.addManager('key1', subMock);
                    expect(subject.getRecord('key1').subscriber).toEqual(subMock);
                });
            });
            describe('add', function() {
                it('should add record to array', function() {
                    expect(Object.keys(subject.getAll())).toHaveLength(3)
                });
                it("should set record key to 'childKey' prop", function() {
                    expect(Object.keys(subject.getAll())[0]).toEqual('key1');
                });
                it("should set record 'main' property to passed arg", function() {
                    expect(subject.getAll().key1).toEqual({
                        main: {
                            streamId: 'key1',
                            name: 'a'
                        }
                    });
                });
                describe("When passing object", function() {
                    describe("When no id property found", function() {
                        it('should throw error', function() {
                            expect(function() {
                                subject.add({
                                    differentId: "string",
                                    name: 'b'
                                });
                                to.flush();
                            }).toThrow();
                            expect(subject.keys()).toHaveLength(3);
                        });
                    });
                });
            });
            describe('remove', function() {
                describe("When passing key", function() {
                    it('should remove correct record', function() {
                        subject.remove('key2');
                        to.flush();
                        expect(subject.key2).not.toBeDefined();
                        expect(subject.keys()).toHaveLength(2);
                    });
                });
                describe("When passing object", function() {
                    it('should remove correct record', function() {
                        subject.remove({
                            streamId: 'key2',
                            name: 'b'
                        });
                        to.flush();
                        expect(subject.key2).not.toBeDefined();
                        expect(subject.keys()).toHaveLength(2);
                    });
                    describe("When no id property found", function() {
                        it('should throw error', function() {
                            expect(function() {
                                subject.remove({
                                    differentId: "string",
                                    name: 'b'
                                });
                                to.flush();
                            }).toThrow();
                            expect(subject.keys()).toHaveLength(3);
                        });
                    });
                });
            });
            describe("extend", function() {
                var dest;

                function Person(str, num) {
                    this.name = str;
                    this.age = num;
                }

                beforeEach(function() {
                    dest = new Person("bob", 55);
                    subject.extend(dest);
                });
                it("should be defined", function() {
                    expect(dest.keys()).toEqual(['key1', 'key2', 'key3']);
                    expect(dest._childKey).toEqual("streamId");
                });


            });
        });

    });

})();
