'use strict'
const clientes = require('../../data/schema/cliente')
const URL = require('url')
const {promisify} = require('util')

const getClientes = promisify(clientes.getAll)
const getClienteById = promisify(clientes.getById)
const getClienteByRFC = promisify(clientes.getByRFC)

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const url = URL.parse(request.url, true)    
    const {rfc} = url.query
    console.log(`rfc: ${rfc}`)
    if (rfc) {
      try {
        await getClienteByRFC(rfc)
        .then((data) => {
          console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } catch(err){
        reply.status(500).send(err)
      }      
    } else {
      try {
        await getClientes()
        .then((data) => {
          console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } catch(err){
        reply.status(500).send(err)
      }
    }
  })
  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params
      if (id){
        try {
          console.log(`id: ${id}`)
          await getClienteById(id)
          .then((data) => {
            console.log(`data: ${data}`)
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })
        } catch(err){
          reply.status(500).send(err)
        }
    } else {
      reply.status(400).send('Bad format. Missing "id" field.')
    }
  })

}
