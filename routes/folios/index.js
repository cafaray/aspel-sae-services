'use strict'

const folios = require('../../data/schema/folio')
const URL = require('url')
const {promisify} = require('util')

const getFoliosCuentasPorPagar = promisify(folios.getAll)
const getFoliosCuentasPorPagarById = promisify(folios.getById)

module.exports = async function (fastify, opts) {
    fastify.get('/', async function (request, reply) {
        try {
            await getFoliosCuentasPorPagar()
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
                await getFoliosCuentasPorPagarById(id)
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
}