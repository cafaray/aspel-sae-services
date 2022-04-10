'use strict'

const proveedores = require('../../data/schema/proveedor')
const {promisify} = require('util')
const URL = require('url')

const getProveedores = promisify(proveedores.getAll)
const getProveedoresById = promisify(proveedores.getById)
const getProveedoresByName = promisify(proveedores.getByName)
const getProveedoresFrom = promisify(proveedores.getFrom)

module.exports = async function (fastify, opts) {
    fastify.get('/', async function (request, reply) {
        try {
            const url = URL.parse(request.url, true)
            const {name, from} = url.query
            if (name){
                await getProveedoresByName(name)
                .then((data) => {
                    // console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            } else if(from) {
                await getProveedoresFrom(from)
                .then((data) => {
                    // console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            } else {
                await getProveedores()
                .then((data) => {
                    // console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            }
        } catch(err) {
            reply.status(500).send(err)
        }
    })
    fastify.get('/:providerId', async function (request, reply) {
        try {
            const {providerId} = request.params
            if (providerId){
                await getProveedoresById(providerId)
                .then((data) => {
                    // console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            } else {
                reply.status(400).send('Bad format. Missing providerId')
            }
        } catch(err) {
            reply.status(500).send(err)
        }
    })
}