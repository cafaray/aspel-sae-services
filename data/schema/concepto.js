'use strict'

const {getDBInstance} = require('../connection')
const {CONCEPTOS, LIMIT} = require('../../configs/config')
const SQL_FIND_ALL = `SELECT * FROM ${CONCEPTOS} ORDER BY DESCR`

const message = `Error in query\n===>Error getting data conceptos:\n`

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getById(idConcepto, cb) {
    const SQL_FINDBY_ID = `SELECT ${LIMIT} * FROM ${CONCEPTOS} c WHERE c.NUM_CPTO = '${idConcepto}'`
    try{
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID, (err, data) => {
            if (err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }       
}


async function getByDescripcion(descripcion, cb) {
    const SQL_FINDBY_DESCRIPCION = `SELECT ${LIMIT} * FROM ${CONCEPTOS} c WHERE c.descr LIKE '%${descripcion}%'`
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_DESCRIPCION, (err, data) => {
            if (err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })        
    } catch (err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getByIdDescripcion(idConcepto, descripcion, cb) {
    const SQL_FINDBY_ID_DESCRIPCION = `SELECT ${LIMIT} * FROM ${CONCEPTOS} c WHERE c.NUM_CPTO = '${idConcepto}' AND c.descr LIKE '%${descripcion}%'`
    try{
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID_DESCRIPCION, (err, data) => {
            if (err){
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
    getAll, getById, getByDescripcion, getByIdDescripcion
}