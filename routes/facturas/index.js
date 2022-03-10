'use strict'
const facturas = require('../../data/schema/factura')
const URL = require('url')
const {promisify} = require('util')

const getFacturas = promisify(facturas.getAll)
const getFacturasDesde = promisify(facturas.getByFrom)
const getFacturasDesdeHasta = promisify(facturas.getByFromTo)
const getFacturaDocumento = promisify(facturas.getDocumentItems)
const getFacturaPartidas = promisify(facturas.getItems)
const getFacturasVentaFecha = promisify(facturas.getBySalesDate)
const getFacturasReporte = promisify(facturas.getSalesReport)

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const url = URL.parse(request.url, true)    
    const {from, to, documentDate} = url.query    
    console.log(`===> QueryParams: \nfrom: ${from}\nto: ${to}\ndocumentDate: ${documentDate}`)
    try {
      if (documentDate){
        console.log(`Getting facturas from date ${documentDate}`)
        await getFacturasVentaFecha(documentDate)
        .then((data) => {
          // console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })      
      } else {
        if (from) {
          if (to) {
            console.log(`Getting facturas from ${from} and to ${to}`)
            await getFacturasDesdeHasta(from, to)
            .then((data) => {
              //console.log(`data: ${data}`)
              reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
              reply.status(500).send(err)
            })
          } else {
            console.log(`Getting facturas from ${from}`)
            await getFacturasDesde(from)
            .then((data) => {
              // console.log(`data: ${data}`)
              reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
              reply.status(500).send(err)
            })
          }
        } else {
            await getFacturas()
            .then((data) => {
              // console.log(`data: ${data}`)
              reply.status(200).send(JSON.parse(data))
            })
            .catch((err) => {
              reply.status(500).send(err)
            })
        }
      }

    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params 
    console.log(`Searching for document ${id}`)
    try {
      if(id){
        await getFacturaDocumento(id)
        .then((data)=>{
          //console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } else {
        reply.status(400).send('Bad format. Missing "from or to" field.')
      }
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.get('/:id/items', async function (request, reply) {
    const {id} = request.params 
    console.log(`Searching for document ${id}`)
    try {
      if(id){
        await getFacturaPartidas(id)
        .then((data)=>{
          //console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } else {
        reply.status(400).send('Bad format. Missing "id" field.')
      }
    } catch(err){
      reply.status(500).send(err)
    }
  })
  fastify.get('/ventas', async function (request, reply) {
    const url = URL.parse(request.url, true)
    const {from, to} = url.query
    console.log(`Getting sales report from ${from} to ${to}`)
    try {
      if(from && to){
        await getFacturasReporte(from, to)
        .then((data)=>{
          //console.log(`data: ${data}`)
          reply.status(200).send(JSON.parse(data))
        })
        .catch((err) => {
          reply.status(500).send(err)
        })
      } else {
        reply.status(400).send('Bad format. Missing "from or to" field.')
      }
    } catch(err){
      reply.status(500).send(err)
    }
  })
  /*
  fastify.get('/details', async function (request, reply) {
    const url = URL.parse(request.url, true)    
    const {from, to} = url.query    
    console.log(`===> QueryParams: \nfrom: ${from}\nto: ${to}`)
    try {
      if (from && to){
          await getFacturasDesdeHastaDetalle(from, to)
          .then((data) => {
            console.log(`data: ${data}`)
            reply.status(200).send(JSON.parse(data))
          })
          .catch((err) => {
            reply.status(500).send(err)
          })
      } else {
        reply.status(400).send('Bad format. Missing "from or to" field.')
      }
    } catch (err) {
      reply.status(500).send(err)
    }
  })
  */
}
