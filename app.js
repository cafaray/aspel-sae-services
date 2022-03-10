'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {
  // Place here your custom code!
    // This parses a body to JSON object
    /*
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
      try {
        console.log(`***** here in app.js body comes with\nbody: ${body}`)
        body = JSON.parse(body)        
        console.log(`provider: ${body.providerId}`)
        /*
        var newBody = {
          raw: body,
          parsed: JSON.parse(body),
        };
        * /
        done(null, body);
      } catch (error) {
        error.statusCode = 400;
        done(error, undefined);
      }
    })
  */
  
  

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
