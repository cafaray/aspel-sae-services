'use strict'

const {getDBInstance} = require('../connection')
const {FOLIOS, LIMIT} = require('../../configs/config')
const SQL_FIND_ALL = `SELECT ${LIMIT} * FROM ${FOLIOS}`

const message = `Error getting data\n===>Error quyering at folios\n`

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err) {
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

async function getById(id, cb) {
    const SQL_FINDBY_ID = `SELECT ${LIMIT} * FROM ${FOLIOS} f WHERE TRIM(f.CVE_FOLIO) = ${id}`
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID, (err, data) => {
            if (err) {
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

module.exports={
    getAll, getById
}