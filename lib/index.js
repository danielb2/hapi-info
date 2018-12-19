'use strict';

// Load modules

const Joi = require('joi');

const Pkg = require('../package.json');


// Declare internals

const internals = {
    schema: {
        path: Joi.string().optional().default('/hapi-info').allow(null),
        pluginFilter: Joi.string().optional().default('(?!)'),
        options: Joi.bool().default(false)
    }
};


exports.register = function (server, options, next) {

    options = Joi.attempt(options, internals.schema);

    server.expose({ info: internals.generateHapiInfo(options.pluginFilter).bind({ server, options }) });

    if (options.path) {
        server.route({
            method: 'GET',
            path: options.path,
            config: {
                tags: ['api'],
                description: 'Returns information about the server instance and its plugins.'
            },
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


internals.generateHapiInfo = function (pluginFilter) {

    const filterRegex = new RegExp(pluginFilter);

    return function () {

        const payload = {
            server: {
                node: process.version,
                hapi: this.server.version,
                info: this.server.info,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            },
            plugins: []
        };

        for (let i = 0; i < this.server.connections.length; ++i) {
            const connection = this.server.connections[i];
            const registrations = Object.keys(connection.registrations);

            for (let j = 0; j < registrations.length; ++j) {
                const pluginKey = registrations[j];
                const plugin = connection.registrations[pluginKey];
                if (!filterRegex.test(plugin.name)) {
                    const info = { name: plugin.name, version: plugin.version };
                    if (this.options.options) {
                        info.options = plugin.options;
                    }

                    payload.plugins.push(info);
                }
            }
        }

        return payload;
    };
};
