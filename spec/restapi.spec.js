var should = require('should'),
    RestApi = require('../lib/restapi'),
    request = require('../lib/request'),
    sinon = require('sinon'),
    Q = require('q');

describe('RestApi', function() {

    beforeEach(function() {
        this.get = sinon.stub(request.Request.prototype, 'get').returns(Q());
        this.put = sinon.stub(request.Request.prototype, 'put').returns(Q());
        this.post = sinon.stub(request.Request.prototype, 'post').returns(Q());
        this.delete = sinon.stub(request.Request.prototype, 'delete').returns(Q());
    });

    afterEach(function() {
        this.get.restore();
        this.put.restore();
        this.post.restore();
        this.delete.restore();
    });

    describe('#constructor', function() {

        beforeEach(function() {
            sinon.spy(request, 'init');
        });

        afterEach(function() {
            request.init.restore();
        });

        it('initializes request with default server and api version', function() {
            var restApi = new RestApi();
            var initArgs = request.init.firstCall.args[0];
            initArgs.server.should.eql('https://rally1.rallydev.com');
            initArgs.apiVersion.should.eql('v2.0');
            restApi.request.should.be.exactly(request.init.firstCall.returnValue);
        });

        it('initializes request with specified server and api version', function() {
            var restApi = new RestApi({
                server: 'http://www.google.com',
                apiVersion: 5
            });
            var initArgs = request.init.firstCall.args[0];
            initArgs.server.should.eql('http://www.google.com');
            initArgs.apiVersion.should.eql(5);
            restApi.request.should.be.exactly(request.init.firstCall.returnValue);
        });

        it('initializes request with default auth options', function() {
            process.env.RALLY_USERNAME = 'user';
            process.env.RALLY_PASSWORD = 'pass';
            var restApi = new RestApi();
            var requestOptions = request.init.firstCall.args[0].requestOptions;
            requestOptions.jar.should.eql(true);
            requestOptions.auth.user.should.eql('user');
            requestOptions.auth.pass.should.eql('pass');
            restApi.request.should.be.exactly(request.init.firstCall.returnValue);
        });

        it('initializes request with specified auth options', function() {
            var restApi = new RestApi({
                requestOptions: {
                    auth: {
                        user: 'user1',
                        pass: 'pass1'
                    }
                }
            });
            var requestOptions = request.init.firstCall.args[0].requestOptions;
            requestOptions.jar.should.eql(true);
            requestOptions.auth.user.should.eql('user1');
            requestOptions.auth.pass.should.eql('pass1');
            restApi.request.should.be.exactly(request.init.firstCall.returnValue);
        });

        it('initializes request with correct integration headers', function() {
            var restApi = new RestApi();
            var initArgs = request.init.firstCall.args[0];
            initArgs.requestOptions.headers.should.eql({
                'X-RallyIntegrationLibrary': 'Rally REST Toolkit for Node.js v0.0.0',
                'X-RallyIntegrationName': 'Rally REST Toolkit for Node.js',
                'X-RallyIntegrationVendor': 'Rally Software, Inc.',
                'X-RallyIntegrationVersion': '0.0.0'
            });
            restApi.request.should.be.exactly(request.init.firstCall.returnValue);
        });
    });

    describe('#create', function() {

        it('translates request options', function() {
            var restApi = new RestApi();
            restApi.create({
                type: 'defect',
                data: {
                    Name: 'A defect'
                },
                fetch: ['FormattedID'],
                scope: {workspace: '/workspace/1234'},
                requestOptions: {
                    qs: {foo: 'bar'}
                }
            });

            this.post.callCount.should.eql(1);
            var args = this.post.firstCall.args[0];
            args.qs.fetch.should.eql('FormattedID');
            args.qs.workspace.should.eql('/workspace/1234');
            args.qs.foo.should.eql('bar');
        });

        it('generates correct post request', function() {
            var restApi = new RestApi();
            var callback = sinon.stub();
            var promise = restApi.create({
                type: 'defect',
                data: {
                    Name: 'A defect'
                }
            }, callback);

            this.post.callCount.should.eql(1);
            var args = this.post.firstCall.args;
            args[0].url.should.eql('/defect/create');
            args[0].json.should.eql({defect: {Name: 'A defect'}});
            args[1].should.be.exactly(callback);
            this.post.firstCall.returnValue.should.be.exactly(promise);
        });
    });

    describe('#update', function() {

        it('translates request options', function() {
            var restApi = new RestApi();
            restApi.update({
                ref: '/defect/1234',
                data: {
                    Name: 'Updated defect'
                },
                fetch: ['FormattedID'],
                scope: {workspace: '/workspace/1234'},
                requestOptions: {
                    qs: {foo: 'bar'}
                }
            });

            this.put.callCount.should.eql(1);
            var args = this.put.firstCall.args[0];
            args.qs.fetch.should.eql('FormattedID');
            args.qs.workspace.should.eql('/workspace/1234');
            args.qs.foo.should.eql('bar');
        });

        it('generates correct put request', function() {
            var restApi = new RestApi();
            var callback = sinon.stub();
            var promise = restApi.update({
                ref: {_ref: '/defect/1234'},
                data: {
                    Name: 'Updated defect'
                }
            }, callback);

            this.put.callCount.should.eql(1);
            var args = this.put.firstCall.args;
            args[0].url.should.eql('/defect/1234');
            args[0].json.should.eql({defect: {Name: 'Updated defect'}});
            args[1].should.be.exactly(callback);
            this.put.firstCall.returnValue.should.be.exactly(promise);
        });
    });

    describe('#delete', function() {

        it('translates request options', function() {
            var restApi = new RestApi();
            restApi.delete({
                ref: '/defect/1234',
                scope: {workspace: '/workspace/1234'},
                requestOptions: {
                    qs: {foo: 'bar'}
                }
            });

            this.delete.callCount.should.eql(1);
            var args = this.delete.firstCall.args[0];
            args.qs.workspace.should.eql('/workspace/1234');
            args.qs.foo.should.eql('bar');
        });

        it('generates correct del request', function() {
            var restApi = new RestApi();
            var callback = sinon.stub();
            var promise = restApi.delete({
                ref: {_ref: '/defect/1234'}
            }, callback);

            this.delete.callCount.should.eql(1);
            var args = this.delete.firstCall.args;
            args[0].url.should.eql('/defect/1234');
            args[1].should.be.exactly(callback);
            this.delete.firstCall.returnValue.should.be.exactly(promise);
        });
    });

    describe('#get', function() {

        it('translates request options', function() {
            var restApi = new RestApi();
            restApi.get({
                ref: '/defect/1234',
                scope: {workspace: '/workspace/1234'},
                fetch: ['FormattedID'],
                requestOptions: {
                    qs: {foo: 'bar'}
                }
            });

            this.get.callCount.should.eql(1);
            var args = this.get.firstCall.args[0];
            args.qs.workspace.should.eql('/workspace/1234');
            args.qs.fetch.should.eql('FormattedID');
            args.qs.foo.should.eql('bar');
        });

        it('generates correct get request', function() {
            var restApi = new RestApi();
            var callback = sinon.stub();
            restApi.get({
                ref: {_ref: '/defect/1234'}
            }, callback);

            this.get.callCount.should.eql(1);
            var args = this.get.firstCall.args;
            args[0].url.should.eql('/defect/1234');
        });

        it('calls back with transformed result', function(done) {
            this.get.yieldsAsync(null, {Errors: [], Warnings: [], Name: 'Foo'});
            var restApi = new RestApi();
            restApi.get({
                ref: {_ref: '/defect/1234'}
            }, function(error, result) {
                should.not.exist(error);
                result.Errors.should.eql([]);
                result.Warnings.should.eql([]);
                result.Object.should.eql({Name: 'Foo'});
                done();
            });
        });

        it('resolves promise with transformed result', function(done) {
            this.get.yieldsAsync(null, {Errors: [], Warnings: [], Name: 'Foo'});
            var restApi = new RestApi();
            var onError = sinon.stub();
            restApi.get({
                ref: {_ref: '/defect/1234'}
            }).then(function(result) {
                    onError.callCount.should.eql(0);
                    result.Errors.should.eql([]);
                    result.Warnings.should.eql([]);
                    result.Object.should.eql({Name: 'Foo'});
                    done();
                }, onError);
        });

        it('calls back with error', function(done) {
            var error = 'Error!';
            this.get.yieldsAsync([error], null);
            var restApi = new RestApi();
            restApi.get({
                ref: {_ref: '/defect/1234'}
            }, function(err, result) {
                err.should.eql([error]);
                should.not.exist(result);
                done();
            });
        });

        it('rejects promise with error', function(done) {
            var error = 'Error!';
            this.get.yieldsAsync([error], null);
            var restApi = new RestApi();
            var onSuccess = sinon.stub();
            restApi.get({
                ref: {_ref: '/defect/1234'}
            }).then(onSuccess, function(err) {
                    onSuccess.callCount.should.eql(0);
                    err.should.eql([error]);
                    done();
                });
        });
    });

    describe('#query', function() {
        //todo
    });
});