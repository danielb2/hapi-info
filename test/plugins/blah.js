exports.register = function (plugin, options, next) {

    return next();
};


exports.register.attributes = {
    name: 'blah',
    version: '1.2.3'
};
