'use strict'

const pagos = require('../../data/schema/pago')
const {promisify} = require('util')
const URL = require('url')

const getPagos = promisify(pagos.getAll)
const getPagosByDate = promisify(pagos.getUnaccountedByDate)
const getPagosByDateProvider = promisify(pagos.getUnaccountedByDateProvider)
const getPagosByProvider = promisify(pagos.getUnaccountedByProvider)
const setActualizaCOI = promisify(pagos.setUpgradeCOI)
const getPagosById = promisify(pagos.getById)

module.exports = async function (fastify, opts) {
    fastify.put('/', async function (request, reply) {
        console.log(`body: ${request.body}`)
        const {supplierId, reference, chargeId, conceptId} = request.body
        console.log(`supplierId= ${supplierId}, reference= ${reference}, chargeId= ${chargeId}, conceptId= ${conceptId}`)
        try{
            if (supplierId && reference && chargeId && conceptId){
                await setActualizaCOI(supplierId, reference, chargeId, conceptId)
                .then((data) => {
                    console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)        
                })
            } else {
                reply.status(400).send('Missing fields to identify the payment. Set valid values for: supplierId, reference, chargeId and conceptId.')
            }
        } catch (err) {
            reply.status(500).send(err)
        }
    })
    fastify.get('/', async function (request, reply) {
        try {
            const url = URL.parse(request.url, true)
            const {appliedDate} = url.query            
            if (appliedDate){
                await getPagosByDate(appliedDate)
                .then((data) => {
                    // console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)
                })
            } else {
                await getPagos()
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
    fastify.get('/:docto', async function (request, reply) {
        try {
            const {docto} = request.params
            if (docto){
                await getPagosById(docto)
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
    fastify.get('/proveedores/:supplierId', async function (request, reply) {
        try {
            const {supplierId} = request.params
            const url =  URL.parse(request.url, true)
            const {appliedDate} = url.query

            if (supplierId){
                if (appliedDate){
                    console.log(`search ${supplierId} and ${appliedDate}`)
                    await getPagosByDateProvider(appliedDate,supplierId)
                    .then((data) => {
                        // console.log(`data: ${data}`)
                        reply.status(200).send(JSON.parse(data))
                    })
                    .catch((err) => {
                        reply.status(500).send(err)
                    })
                } else {
                    await getPagosByProvider(supplierId)
                    .then((data) => {
                        // console.log(`data: ${data}`)
                        reply.status(200).send(JSON.parse(data))
                    })
                    .catch((err) => {
                        reply.status(500).send(err)
                    })    
                }
            } else {
                reply.status(400).send('Bad format. Missing id')
            }
        } catch(err) {
            reply.status(500).send(err)
        }
    })
}