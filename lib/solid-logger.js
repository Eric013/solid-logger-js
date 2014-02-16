module.exports = (function(){
    'use strict';

    var _ = require('underscore'),
        path = require('path'),
        async = require('async'),
        fs = require('fs'),
        logger = {},
        adapters = {},
        config = null;

    logger.config = {};

    /**
     * Local method to load up a write 'job'. We create a tracker so that the async callbacks stay in order and then we
     * kick off the adapterWrite method which recursively loads the adapters and write per their 'write' method. It will
     * also load in the configuration for the adapter each time so you can have the same type of adapters with different
     * settings.
     * @param type error, debug, info, trace, warn
     * @param category User definted category for grouping log entries.
     * @param message Message to be logged.
     */
    function write(type, category, message){
        function adapterWrite(adapter, next){
            adapters[adapter.type].write(type, category, message)
                .then(next);
        }

        function done(){ }

        async.each(config.adapters, adapterWrite, done);
    }

    /**
     * Public method required to load in all of the configuration info for your adapters.
     * @param config Object for your adapters.
     * @returns {logger}
     */
    logger.init = function(configuration){
        config = configuration;

        _.each(config.adapters, function(adapter){
            if(!adapters[adapter.type]){
                adapters[adapter.type] = require('./adapters/' + adapter.type).init(adapter);
            }
        });

        return this;
    };

    /**
     * Method that will load configuration info for your adapters from a file.
     * @param configPath path to your configuration file
     * @returns {logger}
     */
    logger.initWithFile = function(configPath){
        var configString = fs.readFileSync(path.resolve(configPath));

        config = JSON.parse(configString);
        this.init(config);

        return this;
    };

    /**
     * Create a ERROR log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.error = function(category, message){
        write('error', category, message);
    };

    /**
     * Create a INFO log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.info = function(category, message){
        write('info', category, message);
    };

    /**
     * Create a DEBUG log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.debug = function(category, message){
        write('debug', category, message);
    };

    /**
     * Create a WARNING log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.warn = function(category, message){
        write('warn', category, message);
    };

    /**
     * Create a TRACE log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.trace = function(category, message){
        write('trace', category, message);
    };

    return logger;

})();