'use strict';

// Load modules

const Joi = require('@hapi/joi');

const { name, version } = require('../package.json');


// Declare internals

const internals = {
    schema: {
        path: Joi.string().optional().default('/hapi-info').allow(null),
        pluginFilter: Joi.string().optional().default('(?!)'),
        options: Joi.bool().default(false)
    }
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

        const registrations = Object.keys(this.server.registrations);
        for (let i = 0; i < registrations.length; ++i) {
            const pluginKey = registrations[i];
            const plugin = this.server.registrations[pluginKey];
            if (!filterRegex.test(plugin.name)) {
                const info = { name: plugin.name, version: plugin.version };
                if (this.options.options) {
                    info.options = plugin.options;
                }

                payload.plugins.push(info);
            }
        }

        return payload;
    };
};

module.exports = {
    name,
    version,
    async register(server, options) {

        options = Joi.attempt(options, internals.schema);
        await server.expose({ info: internals.generateHapiInfo(options.pluginFilter).bind({ server, options }) });
        if (options.path) {
            server.route({
                method: 'GET',
                path: options.path,
                config: {
                    tags: ['api'],
                    description: 'Returns information about the server instance and its plugins.'
                },
                handler: async function (request, h) {

                    const payload = await server.plugins[name].info();
                    return payload;
                }
            });
        }

    }
};
