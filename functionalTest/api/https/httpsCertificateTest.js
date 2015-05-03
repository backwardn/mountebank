'use strict';

var assert = require('assert'),
    api = require('../api'),
    promiseIt = require('../../testHelpers').promiseIt,
    port = api.port + 1,
    timeout = parseInt(process.env.SLOW_TEST_TIMEOUT_MS || 4000),
    fs = require('fs'),
    client = require('../http/baseHttpClient').create('https'),
    key = fs.readFileSync(__dirname + '/cert/key.pem', 'utf8'),
    cert = fs.readFileSync(__dirname + '/cert/cert.pem', 'utf8');

describe('https imposter', function () {
    this.timeout(timeout);

    promiseIt('should support sending key/cert pair during imposter creation', function () {
        var request = {
            protocol: 'https',
            port: port,
            key: key,
            cert: cert,
            name: this.name
        };

        return api.post('/imposters', request).then(function (response) {
            assert.strictEqual(response.statusCode, 201);
            return client.get('/', port);
        }).then(function (response) {
            assert.strictEqual(response.statusCode, 200);
        }).finally(function () {
            return api.del('/imposters');
        });
    });

    promiseIt('should work with mutual auth', function () {
        var request = { protocol: 'https', port: port, mutualAuth: true, name: this.name };

        return api.post('/imposters', request).then(function (response) {
            assert.strictEqual(response.statusCode, 201);
            return client.responseFor({
                method: 'GET',
                path: '/',
                port: port,
                agent: false,
                key: key,
                cert: cert
            });
        }).then(function (response) {
            assert.strictEqual(response.statusCode, 200);
        }).finally(function () {
            return api.del('/imposters');
        });
    });
});