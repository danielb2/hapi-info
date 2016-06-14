'use strict';

// Load modules

const Path = require('path');
const Hoek = require('hoek');
const Joi = require('joi');

const Pkg = require('../package.json');
const ServerPkg = require(Path.join(process.cwd(), './package.json'));


// Declare internals

const internals = {
    schema: {
        path: Joi.string().optional().default('/hapi-info').allow(null)
    }
};


exports.register = function (server, options, next) {

    const validation = Joi.validate(options, internals.schema);
    Hoek.assert(validation.error === null, 'Invalid option(s)');
    options = validation.value;

    server.expose({ info: internals.generateHapiInfo.bind(server) });

    if (options.path) {
        server.route({
            method: 'GET',
            path: options.path,
            handler: function (request, reply) {

                const payload = server.plugins[Pkg.name].info();
                return reply(payload);
            }
        });
    }

    next();
};


exports.register.attributes = {
    pkg: Pkg
};


internals.generateHapiInfo = function () {

    const payload = {
        server: {
            node: process.version,
            hapi: this.version,
            host: this.info.host,
            port: this.info.port,
            uri: this.info.uri,
            api: ServerPkg.version
        },
        plugins: []
    };

    for (let i = 0; i < this.connections.length; ++i) {
        const connection = this.connections[i];
        const registrations = Object.keys(connection.registrations);

        for (let j = 0; j < registrations.length; ++j) {
            const pluginKey = registrations[j];
            const plugin = connection.registrations[pluginKey];
            payload.plugins.push({ name: plugin.name, version: plugin.version });
        }
    }

    return payload;
};
