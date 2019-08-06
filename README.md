[![Build Status](https://travis-ci.org/danielb2/hapi-info.svg?branch=master)](https://travis-ci.org/danielb2/hapi-info)

# hapi-info

`hapi-info` is a plugin to display information about the hapi server and the
plugins it's running.


### Usage

``` javascript
var HapiInfo = require('hapi-info');
const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });
    await server.register({ plugin: HapiInfo });
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    process.exit(1);
});

init();
```

### Options

The following options are available:

* `path`: The route path where the information is available. Default: `/hapi-info`. Setting path to `null` means a route is not created but the server function is still [exposed].
* `pluginFilter`: A RegExp used to filter out plugins from the returned information.
* `options`: boolean. default: false. when turned on, the options passed to the plugin will also be displayed


### Output example

``` javascript
{
    server: {
        node: 'v10.15.3',
        hapi: '17.9.0',
        info: {
            created: 1545253617087,
            started: 0,
            host: 'sanji.local',
            port: 0,
            protocol: 'http',
            id: 'sanji.local:17557:jpvo3ttr',
            uri: 'http://sanji.local'
        },
        uptime: 2.501,
        memoryUsage: {
            rss: 68087808,
            heapTotal: 59801600,
            heapUsed: 29752280,
            external: 41684
        },
        cpuUsage: {
            user: 1489450,
            system: 186843
        }
    },
    plugins: [
        {
            name: 'hapi-info',
            version: '2.0.6'
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
}

```


### `server.plugins['hapi-info'].info()`

The function `server.plugins['hapi-info'].info()` is also [exposed] and
contains the same information as the endpoint as an object as opposed to json
output.

[exposed]: http://hapijs.com/api#serverexposekey-value
