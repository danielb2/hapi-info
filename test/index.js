'use strict';
// Load modules

const Code = require('@hapi/code');
const Glue = require('@hapi/glue');
const Lab = require('@hapi/lab');


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.test;


const internals = {};


internals.prepareServer = async function (options, callback) {

    const manifest = {
        register: {
            plugins: [
                { plugin: '../', options },
                { plugin: './plugins/blah.js', options: null },
                { plugin: './plugins/main.js', options: null }
            ]
        }
    };

    try {
        const server = await Glue.compose(manifest, { relativeTo: __dirname });
        return server;
    }
    catch (error) {
        return error;
    }
};


describe('routes', () => {

    it('prints plugin and server information', async () => {

        const server  = await internals.prepareServer({});
        const res = await server.inject('/hapi-info');

        expect(res.statusCode).to.equal(200);
        expect(res.result.server.node).to.equal(process.version);
        expect(res.result.server.hapi).to.equal(server.version);
        expect(res.result.server.info).to.equal(server.info);
        expect(res.result.server.uptime).to.be.about(1,2);
        expect(res.result.server.memoryUsage).to.be.an.object();
        expect(res.result.server.cpuUsage).to.be.an.object();

    });

    it('prints plugin and server to a different path', async () => {

        const server = await internals.prepareServer({ path: '/foo' });
        const res = await server.inject('/foo');
        expect(res.statusCode).to.equal(200);
        expect(res.result.server.node).to.equal(process.version);
        expect(res.result.server.hapi).to.equal(server.version);
        expect(res.result.server.info).to.equal(server.info);
        expect(res.result.server.uptime).to.be.about(1,2);
        expect(res.result.server.memoryUsage).to.be.an.object();
        expect(res.result.server.cpuUsage).to.be.an.object();
    });

    it('prints plugin and option information', async () => {

        const server = await internals.prepareServer({ options: true });
        const res = await server.inject('/hapi-info');

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
    });

    it('prints plugin and server info using expose', async () => {

        const server = await internals.prepareServer({ path: '/foo' });
        const info = server.plugins['hapi-info'].info();
        expect(info.plugins[0].options).to.not.exist();
        expect(info.server.node).to.equal(process.version);
        expect(info.server.hapi).to.equal(server.version);
        expect(info.server.info).to.equal(server.info);
        expect(info.server.uptime).to.be.about(1,2);
        expect(info.server.memoryUsage).to.be.an.object();
        expect(info.server.cpuUsage).to.be.an.object();
    });

    it('setting path to null doesnt create route, but still exposes info data', async () => {

        const server = await internals.prepareServer({ path: null });
        const res = await server.inject('/hapi-info');
        expect(res.statusCode).to.equal(404);
        const info = server.plugins['hapi-info'].info();
        expect(info.server.node).to.equal(process.version);
    });

    it('returned plugins can be filtered', async () => {

        const server = await internals.prepareServer({ path: null, pluginFilter: '^(?!hapi)' });
        const info = server.plugins['hapi-info'].info();
        expect(info.plugins.length).to.equal(1);
        expect(info.plugins[0].name).to.equal('hapi-info');
    });

    it('setting no plugin filter returns all plugins', async () => {

        const server = await internals.prepareServer({ path: null });
        const info = server.plugins['hapi-info'].info();
        expect(info.plugins.length).to.equal(3);
        expect(info.plugins[0].name).to.equal('hapi-info');
    });
});
