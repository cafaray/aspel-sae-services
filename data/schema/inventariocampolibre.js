'use strict'

const {getDBInstance} = require('../connection')
const {LIMIT, INVENTARIO_CAMPOLIBRE} = require('../../configs/config')
const SQL_FIND_ALL = `SELECT ${LIMIT} * FROM ${INVENTARIO_CAMPOLIBRE}`

const message = `Error getting data.\n===>Error querying at inventarios.campolibre:\n`

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if(err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getById(id, cb) {
    const SQL_FINDBY_ID = `SELECT ${LIMIT} * FROM ${INVENTARIO_CAMPOLIBRE} i WHERE i.CVE_PROD = '${id}'`
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID, (err, data) => {
            if(err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}
module.exports={
    getAll, getById
}