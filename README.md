`hapi-info` is a plugin to display information about the hapi server and the
plugins it's running.

# Usage

``` javascript
var HapiInfo = require('hapi-info');
var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection();

server.register({ register: HapiInfo, options: {} }, function (err) {
    server.start(function () {
        // ..
    });
});
```

# Options

The following options are available:

* `path`: The route path where the information is available. Default: `/hapi-info`. Setting path to `null` means a route is not created but the server function is still [exposed].


# Output example

``` javascript
{
    server: {
        node: 'v0.10.39',
        hapi: '8.8.1',
        host: 'sanji.local',
        port: 0,
        uri: 'http://sanji.local'
    },
    plugins: [
        {
            name: 'hapi-info',
            version: '1.0.0'
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


# `server.plugins['hapi-info'].info()`

The function `server.plugins['hapi-info'].info()` is also [exposed] and
contains the same information as the endpoint as an object as opposed to json
output.

[exposed]: http://hapijs.com/api#serverexposekey-value
