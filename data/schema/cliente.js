'use strict'

const {getDBInstance} = require('../connection')
const {CLIENTES, LIMIT} = require('../../configs/config')

const TABLE_FIELDS = `TRIM(CLAVE) CLAVE, NOMBRE, RFC, COALESCE(CURP, '') CURP, COALESCE(CLASIFIC, '') CLASIFIC, 
COALESCE(CUENTA_CONTABLE, '') CUENTA_CONTABLE, UUID, COALESCE(USO_CFDI, '') USO_CFDI, COALESCE(NUMIDREGFISCAL, '') NUMIDREGFISCAL, 
COALESCE(FORMADEPAGOSAT, '') FORMADEPAGOSAT, COALESCE(ADDENDAF, '') ADDENDAF, COALESCE(ADDENDAD, '') ADDENDAD, COALESCE(ADDENDAG, '') ADDENDAG, 
COALESCE(ADDENDAE, '') ADDENDAE, COALESCE(ADDENDAT, '') ADDENDAT, STATUS AS ESTATUS`

const SQL_FIND_ALL=`SELECT ${LIMIT} ${TABLE_FIELDS} FROM ${CLIENTES}`
const SQL_FINDBY_ID = `SELECT ${TABLE_FIELDS} FROM ${CLIENTES} WHERE trim(CLAVE) = ?`
const SQL_FINDBY_RFC = `SELECT ${TABLE_FIELDS} FROM ${CLIENTES} WHERE RFC = ?`

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log('error in query')
        console.log('===> Error getting data clientes.getAll:\n${err}')
        setImmediate(() => cb(err))
    }
}

async function getById(claveCliente, cb) {
    try {
        const dbInstance = await getDBInstance()                
        // console.log(`query: ${SQL_FINDBY_ID}`)
        dbInstance.query(SQL_FINDBY_ID, [claveCliente], (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log('error in query')
        console.log('===> Error getting data clientes.ById:\n${err}')
        setImmediate(() => cb(err))
    }
}

async function getByRFC(rfc, cb) {
    try {
        const dbInstance = await getDBInstance()        
        // console.log(`query: ${SQL_FINDBY_RFC}`)
        dbInstance.query(SQL_FINDBY_RFC, [rfc], (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log('error in query')
        console.log('===> Error getting data clientes.ByRFC:\n${err}')
        setImmediate(() => cb(err))
    }
}
module.exports={getAll, getById, getByRFC}