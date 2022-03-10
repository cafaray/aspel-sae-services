'use strict'
const compras = require('../../data/schema/compra')
const URL = require('url')
const {promisify} = require('util')

const getCompras = promisify(compras.getAll)
const getComprasFrom = promisify(compras.getFrom)
const getComprasFromTo = promisify(compras.getFromTo)
const getComprasFromToDetails = promisify(compras.getFromToDetails)
const getDocument = promisify(compras.getDocument)
const getItems = promisify(compras.getItems)


module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const url = URL.parse(request.url, true)    
    const {from, to} = url.query    
    console.log(`===> QueryParams: \nfrom: ${from}\nto: ${to}`)
    try {
      if (from) {
          if (to) {
            await getComprasFromTo(from, to)
            .then((data) => {
              console.log(`data: ${data}`)
              reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
              reply.status(500).send(err)
            })
          } else {
            await getComprasFrom(from)
            .then((data) => {
              console.log(`data: ${data}`)
              reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
              reply.status(500).send(err)
            })
          }
      } else {
          await getCompras()
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
  fastify.get('/details', async function (request, reply) {
    const url = URL.parse(request.url, true)    
    const {from, to} = url.query    
    console.log(`===> QueryParams: \nfrom: ${from}\nto: ${to}`)
    try {
      if (from && to){
        let data = {documents:[], items:[]}
          await getComprasFromTo(from, to)
          .then((documentos) => {
            //console.log(`\n\n====>documentos:\n${documentos}`)
            data.documents = JSON.parse(documentos)
          })
          .catch((err) => {
            reply.status(500).send(err)
          })
          await getComprasFromToDetails(from, to)
          .then((partidas) => {
            //console.log(`\n\n====>partidas:\n${partidas}`)
            data.items = JSON.parse(partidas)
          })
          .catch((err) => {
            reply.status(500).send(err)
          })          
          //console.log(`\n\n====>complete:\n${JSON.stringify(data)}`)
          reply.status(200).send(data)
      } else {
        reply.status(400).send('Bad format. Missing "from or to" field.')
      }
    } catch (err) {
      reply.status(500).send(err)
    }
  })
  fastify.get('/:id', async function (request, reply) {
    try {
      const {id} = request.params
      //console.log(`getting items of ${id}`)
      let response = ''
      await getDocument(id)
      .then((data) => {        
        console.log(`document found: ${JSON.parse(data).length}`)
        response = JSON.parse(data)
      })      
      .catch((err) => {
        reply.status(500).send(err)
      })
      if(response.length>0){
        await getItems(id)
        .then((data) => {
          console.log(`items: ${data}`)        
          response[0].items = JSON.parse(data)
        })
        .catch((err) => {
          reply.status(500).send('Internal server error')
        })
      }
      console.log(`response: ${JSON.stringify(response)}`)
      reply.status(200).send(response)
    } catch (err) {
      reply.status(500).send(err)
    }
  })
}
