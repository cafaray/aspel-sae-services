'use strict'

const inventarios = require('../../data/schema/inventario')
const inventario_camposlibres = require('../../data/schema/inventariocampolibre')
const {promisify} = require('util')

const getInventarios = promisify(inventarios.getAll)
const getInventariosById = promisify(inventarios.getById)

const getInventarioCampoLibres = promisify(inventario_camposlibres.getAll)
const getInventarioCampoLibresById = promisify(inventario_camposlibres.getById)

module.exports = async function (fastify, opts) {
    fastify.get('/', async function (request, reply) {
        try {
            await getInventarios()
            .then((data) => {
                // console.log(`data: ${data}`)
                reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
                reply.status(500).send(err)
            })
        } catch(err) {
            reply.status(500).send(err)
        }
    })
    fastify.get('/:id', async function (request, reply) {
        try {
            const {id} = request.params
            if (id){
                await getInventariosById(id)
                .then((data) => {
                    // console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            } else {
                reply.status(400).send('Bad format. Missing id')
            }
        } catch(err) {
            reply.status(500).send(err)
        }
    })
    fastify.get('/campolibres', async function (request, reply) {
        try {
            await getInventarioCampoLibres()
            .then((data) => {
                reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
                reply.status(500).send(err)
            })
        } catch(err){
            reply.status(500).send(err)
        }
    })
    fastify.get('/campolibres/:id', async function (request, reply) {
        try {
            const {id} = request.params
            if (id){
                await getInventarioCampoLibresById(id)
                .then((data) => {
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            } else {
                reply.status(400).send('Bad format. Missing id')
            }
        } catch(err){
            reply.status(500).send(err)
        }        
    })
}