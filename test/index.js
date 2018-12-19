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


describe('routes', () => {

    it('prints plugin and server information', (done) => {

        internals.prepareServer({}, (err, server) => {

            server.inject('/hapi-info', (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.result.server.node).to.equal(process.version);
                expect(res.result.server.hapi).to.equal(server.version);
                expect(res.result.server.info).to.equal(server.info);
                expect(res.result.server.uptime).to.be.about(1,2);
                expect(res.result.server.memoryUsage).to.be.an.object();
                expect(res.result.server.cpuUsage).to.be.an.object();
                done(err);
            });
        });
    });

    it('prints plugin and server to a different path', (done) => {

        internals.prepareServer({ path: '/foo' }, (err, server) => {

            server.inject('/foo', (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.result.server.node).to.equal(process.version);
                expect(res.result.server.hapi).to.equal(server.version);
                expect(res.result.server.info).to.equal(server.info);
                expect(res.result.server.uptime).to.be.about(1,2);
                expect(res.result.server.memoryUsage).to.be.an.object();
                expect(res.result.server.cpuUsage).to.be.an.object();
                done(err);
            });
        });
    });

    it('prints plugin and option information', (done) => {

        internals.prepareServer({ options: true }, (err, server) => {

            server.inject('/hapi-info', (res) => {

                expect(res.statusCode).to.equal(200);
                const info = server.plugins['hapi-info'].info();
                expect(info.plugins[0].options).to.equal({ options: true });
                expect(res.result.plugins[0].options).to.equal({ options: true });
                expect(res.result.plugins[1].options).to.equal(null);
                expect(res.result.plugins[2].options).to.equal(null);
                expect(res.result.server.node).to.equal(process.version);
                expect(res.result.server.hapi).to.equal(server.version);
                expect(res.result.server.info).to.equal(server.info);
                expect(res.result.server.uptime).to.be.about(1,2);
                expect(res.result.server.memoryUsage).to.be.an.object();
                expect(res.result.server.cpuUsage).to.be.an.object();
                done(err);
            });
        });
    });

    it('prints plugin and server info using expose', (done) => {

        internals.prepareServer({ path: '/foo' }, (err, server) => {

            const info = server.plugins['hapi-info'].info();
            expect(info.plugins[0].options).to.not.exist();
            expect(info.server.node).to.equal(process.version);
            expect(info.server.hapi).to.equal(server.version);
            expect(info.server.info).to.equal(server.info);
            expect(info.server.uptime).to.be.about(1,2);
            expect(info.server.memoryUsage).to.be.an.object();
            expect(info.server.cpuUsage).to.be.an.object();
            done(err);
        });
    });

    it('setting path to null doesnt create route, but still exposes info data', (done) => {

        internals.prepareServer({ path: null }, (err, server) => {

            server.inject('/hapi-info', (res) => {

                expect(res.statusCode).to.equal(404);
                const info = server.plugins['hapi-info'].info();
                expect(info.server.node).to.equal(process.version);
                done(err);
            });
        });
    });

    it('returned plugins can be filtered', (done) => {

        internals.prepareServer({ path: null, pluginFilter: '^(?!hapi)' }, (err, server) => {

            const info = server.plugins['hapi-info'].info();
            expect(info.plugins.length).to.equal(1);
            expect(info.plugins[0].name).to.equal('hapi-info');
            done(err);
        });
    });

    it('setting no plugin filter returns all plugins', (done) => {

        internals.prepareServer({ path: null }, (err, server) => {

            const info = server.plugins['hapi-info'].info();
            expect(info.plugins.length).to.equal(3);
            expect(info.plugins[0].name).to.equal('hapi-info');
            done(err);
        });
    });
});
