// Load modules
var Hoek = require('hoek');
var Joi = require('joi');


// Declare internals
var internals = {
    schema: {
        path: Joi.string().optional().default('/hapi-info')
    }
};


exports.register = function (server, options, next) {

    var validation = Joi.validate(options, internals.schema);
    Hoek.assert(validation.error === null, 'Invalid option(s)');
    options = validation.value;

    server.route({
        method: 'GET',
        path: options.path,
        handler: function (request, reply) {

            var payload = {
                server: {
                    node: process.version,
                    hapi: server._sources[0].server.version
                },
                plugins: []
            };
            for (var i = 0, il = server._sources.length; i < il; ++i) {
                var source = server._sources[i];
                if (!source._registrations) {
                    continue;
                }
                var registrations = Object.keys(source._registrations);

                for (var j = 0, ij = registrations.length; j < ij; ++j) {
                    var pluginKey = registrations[j];
                    var plugin = source._registrations[pluginKey];
                    payload.plugins.push({ name: plugin.name, version: plugin.version });
                }
            }
            return reply(payload);
        }
    });

    next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};
