'use strict';

const AWS = require('aws-sdk');
const Joi = require('joi');
const Hoek = require('hoek');
const Schemas = require('./schemas');

const validateOptions = {
    abortEarly: false
};

exports.register = async function (server, options, next) {

    options = Hoek.applyToDefaults({
        global: {},
        services: []
    }, options);

    options = Hoek.applyToDefaults({
        global: {},
        services: []
    }, options);

    const globalConfig = await Joi.validate(options.global, Schemas.global, validateOptions);
    const serviceConfig = await Joi.validate(options.services, Schemas.services, validateOptions);

    const instance = AWS.config.update(globalConfig);

    const services = {};

    options.services.map((item) => {

        const Service = AWS[item.service];
        services[item.name] = new Service(item.options);
    });

    const result = { globalConfig, serviceConfig, instance, services };

    server.expose('aws', result.services);
    server.decorate('server', 'aws', result.services);
    server.decorate('request', 'aws', result.services);

    next(null, result);
};

exports.register.attributes = {
    pkg: require('../package.json')
};
