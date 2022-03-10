'use strict'

const pagos = require('../../data/schema/pago')
const {promisify} = require('util')
const URL = require('url')

const getPagos = promisify(pagos.getAll)
const getPagosByDate = promisify(pagos.getUnaccountedByDate)
const getPagosByDateProvider = promisify(pagos.getUnaccountedByDateProvider)
const getPagosByProvider = promisify(pagos.getUnaccountedByProvider)
const setActualizaCOI = promisify(pagos.setUpgradeCOI)

module.exports = async function (fastify, opts) {
    fastify.put('/', async function (request, reply) {
        console.log(`body: ${request.body}`)
        const {providerId, reference, chargeId, conceptId} = request.body
        console.log(`providerId= ${providerId}, reference= ${reference}, chargeId= ${chargeId}, conceptId= ${conceptId}`)
        try{
            if (providerId && reference && chargeId && conceptId){
                await setActualizaCOI(providerId, reference, chargeId, conceptId)
                .then((data) => {
                    console.log(`data: ${data}`)
                    reply.status(200).send(JSON.parse(data))
                })
                .catch((err) => {
                    reply.status(500).send(err)        
                })
            } else {
                reply.status(400).send('Missing fields to identify the payment. Set valid values for: providerId, reference, chargeId and conceptId.')
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
    fastify.get('/:providerId', async function (request, reply) {
        try {
            const {providerId} = request.params
            const url =  URL.parse(request.url, true)
            const {appliedDate} = url.query
            if (providerId){
                if (appliedDate){
                    await getPagosByDateProvider(appliedDate,providerId)
                    .then((data) => {
                        // console.log(`data: ${data}`)
                        reply.status(200).send(JSON.parse(data))
                    })
                    .catch((err) => {
                        reply.status(500).send(err)
                    })
                } else {
                    await getPagosByProvider(providerId)
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