// Load modules

var Hoek = require('hoek');
var Joi = require('joi');

var Pkg = require('../package.json');


// Declare internals

var internals = {
    schema: {
        path: Joi.string().optional().default('/hapi-info').allow(null)
    }
};


exports.register = function (server, options, next) {

    var validation = Joi.validate(options, internals.schema);
    Hoek.assert(validation.error === null, 'Invalid option(s)');
    options = validation.value;

    server.expose({ info: internals.generateHapiInfo.bind(server) });

    if (options.path) {
        server.route({
            method: 'GET',
            path: options.path,
            handler: function (request, reply) {

                var payload = server.plugins[Pkg.name].info();
                return reply(payload);
            }
        });
    }

    next();
};


exports.register.attributes = {
    pkg: Pkg
};


internals.generateHapiInfo = function() {

    var payload = {
        server: {
            node: process.version,
            hapi: this._sources[0].server.version,
            host: this.info.host,
            port: this.info.port,
            uri: this.info.uri
        },
        plugins: []
    };

    for (var i = 0, il = this._sources.length; i < il; ++i) {
        var source = this._sources[i];
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

    return payload;
};


