'use strict';
// Load modules

const Code = require('code');
const Glue = require('glue');
const Lab = require('lab');


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.test;


const internals = {};


internals.prepareServer = function (options, callback) {

    const manifest = {
        registrations: [
            { plugin: { register: '../', options } },
            { plugin: { register:'./plugins/blah.js', options: null } },
            { plugin: { register: './plugins/main.js', options: null } }
        ]
    };

    Glue.compose(manifest, { relativeTo: __dirname }, (err, server) => {

        expect(err).to.not.exist();
        return callback(err, server);
    });
};


internals.makeResult = function (server) {

    const result = {
        server: {
            node: process.version,
            hapi: server.version,
            host: server.info.host,
            port: server.info.port,
            uri: server.info.uri
        },
        plugins: [
            {
                name: 'hapi-info',
                version: require('./../package.json').version
            },
            {
                name: 'blah',
                version: '1.2.3'
            },
            {
                name: 'main',
                version: '0.1.1'
            }
        ]
    };

    return result;
};

internals.makeFilteredResult = function (server) {

    const result = {
        server: {
            node: process.version,
            hapi: server.version,
            host: server.info.host,
            port: server.info.port,
            uri: server.info.uri
        },
        plugins: [
            {
                name: 'hapi-info',
                version: require('./../package.json').version
            }
        ]
    };

    return result;
};

describe('routes', () => {

    it('prints plugin and server information', (done) => {

        internals.prepareServer({}, (err, server) => {

            server.inject('/hapi-info', (res) => {

                const result = internals.makeResult(server);
                expect(res.result).to.equal(result);
                done(err);
            });
        });
    });

    it('prints plugin and server to a different path', (done) => {

        internals.prepareServer({ path: '/foo' }, (err, server) => {

            server.inject('/foo', (res) => {

                const result = internals.makeResult(server);
                expect(res.result).to.equal(result);
                done(err);
            });
        });
    });

    it('prints plugin and option information', (done) => {

        internals.prepareServer({ options: true }, (err, server) => {

            server.inject('/hapi-info', (res) => {

                const result = internals.makeResult(server);
                result.plugins[0].options = { options: true };
                result.plugins[1].options = null;
                result.plugins[2].options = null;
                expect(res.result).to.equal(result);
                done(err);
            });
        });
    });

    it('prints plugin and server info using expose', (done) => {

        internals.prepareServer({ path: '/foo' }, (err, server) => {

            const info = server.plugins['hapi-info'].info();
            const result = internals.makeResult(server);
            expect(info).to.equal(result);
            done(err);
        });
    });

    it('setting path to null doesnt create route, but still exposes info data', (done) => {

        internals.prepareServer({ path: null }, (err, server) => {

            server.inject('/hapi-info', (res) => {

                expect(res.statusCode).to.equal(404);
                const info = server.plugins['hapi-info'].info();
                const result = internals.makeResult(server);
                expect(info).to.equal(result);
                done(err);
            });
        });
    });

    it('returned plugins can be filtered', (done) => {

        internals.prepareServer({ path: null, pluginFilter: '^(?!hapi)' }, (err, server) => {

            const info = server.plugins['hapi-info'].info();
            const result = internals.makeFilteredResult(server);
            expect(info).to.equal(result);
            done(err);
        });
    });

    it('setting no plugin filter returns all plugins', (done) => {

        internals.prepareServer({ path: null }, (err, server) => {

            const info = server.plugins['hapi-info'].info();
            const result = internals.makeResult(server);
            expect(info).to.equal(result);
            done(err);
        });
    });
});
