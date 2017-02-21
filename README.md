[![Build Status](https://travis-ci.org/danielb2/hapi-info.svg?branch=master)](https://travis-ci.org/danielb2/hapi-info)

# hapi-info

`hapi-info` is a plugin to display information about the hapi server and the
plugins it's running.


### Usage

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

### Options

The following options are available:

* `path`: The route path where the information is available. Default: `/hapi-info`. Setting path to `null` means a route is not created but the server function is still [exposed].
* `auth`: The route auth option to specify the auth strategy and mode.
* `pluginFilter`: A RegExp used to filter out plugins from the returned information.


### Output example

``` javascript
{
    "server":{
        "node":"v4.2.6",
        "hapi":"11.1.4",
        "host":"inis",
        "port":0,
        "uri":"http://inis"
    },
    "plugins":[
        {
            "name":"hapi-info",
            "version":"2.0.0"
        },
        {
            "name":"blah",
            "version":"1.2.3"
        },
        {
            "name":"main",
            "version":"0.1.1"
        }
    ]
}
```


### `server.plugins['hapi-info'].info()`

The function `server.plugins['hapi-info'].info()` is also [exposed] and
contains the same information as the endpoint as an object as opposed to json
output.

[exposed]: http://hapijs.com/api#serverexposekey-value
