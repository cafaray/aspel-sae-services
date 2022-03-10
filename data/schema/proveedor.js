'use strict'

const {getDBInstance} = require('../connection')
const {PROVEEDORES, LIMIT} = require('../../configs/config')
const SQL_FIND_ALL = `SELECT trim(CLAVE) CLAVE,STATUS,NOMBRE, RFC, CLASIFIC,CURP,CVE_ZONA,CON_CREDITO,DIASCRED,LIMCRED,CVE_BITA,ULT_PAGOD,ULT_PAGOM,
ULT_PAGOF,ULT_COMPD,ULT_COMPM,ULT_COMPF,SALDO,VENTAS,DESCUENTO,TIP_TERCERO,TIP_OPERA,CVE_OBS,CUENTA_CONTABLE,FORMA_PAGO,BENEFICIARIO,
TITULAR_CUENTA,BANCO,SUCURSAL_BANCO,CUENTA_BANCO,CLABE,DESC_OTROS FROM ${PROVEEDORES} ORDER BY NOMBRE`

const message = `Error getting data.\n===>Error querying at proveedores:\n`

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
    const SQL_FINDBY_ID = `SELECT ${LIMIT} * FROM ${PROVEEDORES} i WHERE trim(i.CLAVE) = '${id}' ORDER BY NOMBRE`
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
async function getByName(name, cb) {
    const SQL_FINDBY_NAME = `SELECT ${LIMIT} * FROM ${PROVEEDORES} i WHERE i.NOMBRE LIKE '%${name}%' ORDER BY NOMBRE`
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_NAME, (err, data) => {
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
    getAll, getById, getByName
}