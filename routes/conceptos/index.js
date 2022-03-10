'use strict'
const conceptos = require('../../data/schema/concepto')
const URL = require('url')
const {promisify} = require('util')

const getConceptos = promisify(conceptos.getAll)
const getConceptoId = promisify(conceptos.getById)
const getConceptoDescripcion = promisify(conceptos.getByDescripcion)
const getConceptoIdDescripcion = promisify(conceptos.getByIdDescripcion)

module.exports = async function (fastify, opts) {

  fastify.get('/', async function (request, reply) {
    try {
      let body='', description
      for await (const data of request.raw) {
        body += data.toString()
      }
      if(body!==''){
        body = JSON.parse(body)
        console.log(`request.body: ${body}`)
        description = body.description
        console.log(`===> BodyParams: \ndescription: ${description}`)
      }
      if (description) {
        await getConceptoDescripcion(description)
        .then((data) => {
          console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } else {
          await getConceptos()
          .then((data) => {
            //console.log(`data: ${data}`)
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })
      }
    } catch(err){
      reply.status(500).send(err)
    }
  })

  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params    
    if (id){
      try {
        let body='', description
        for await (const data of request.raw) {
          body += data.toString()
        }
        if(body!==''){
          body = JSON.parse(body)
          console.log(`request.body: ${body}`)
          description = body.description
          console.log(`===> BodyParams: \ndescription: ${description}`)
        }
        if (description){
            await getConceptoIdDescripcion(id, description)
            .then((data) => {
              console.log(`data: ${data}`)
              reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
              reply.status(500).send(err)
            })
        } else {
          await getConceptoId(id)
          .then((data) => {
            console.log(`data: ${data}`)
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })        
        }
      } catch (err) {
        reply.status(500).send(err)
      }
    } else {
      reply.status(400).send('Bad format. Missing "id" field.')
    }
  })
}
