'use strict'

const {getDBInstance} = require('../connection')
const {FACTURAS, FACTURA_PARTIDAS, CLIENTES, LIMIT, INVENTARIOS, INVENTARIO_CAMPOLIBRE} = require('../../configs/config')

const SQL_FIND_ALL = `SELECT ${LIMIT} TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) AS CVE_CLPV, NOMBRE, FOLIO, SERIE, 
(SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as DESCRIPCION,
SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, NUM_MONED AS MONEDA, TIPCAMB AS TIPO_CAMBIO, ROUND(CAN_TOT, 2) IMPORTE, ROUND(IMP_TOT4, 2) AS IVA, ROUND(IMP_TOT3, 2) AS IEPS, f.STATUS ESTATUS, ROUND(IMPORTE, 2) AS TOTAL
FROM ${FACTURAS} f INNER JOIN ${CLIENTES} c ON f.CVE_CLPV = c.CLAVE 
ORDER BY CVE_DOC`

const SQL_FINDBY_ID = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, NOMBRE, FOLIO, SERIE, 
(SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as IDENTIFICADOR,
SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, 
NUM_MONED AS MONEDA, TIPCAMB AS TIPO_CAMBIO, ROUND(CAN_TOT, 2) TOTAL, ROUND(IMP_TOT4, 2) AS IVA, ROUND(IMP_TOT3, 2) AS IEPS, ROUND(IMPORTE, 2) AS IMPORTE,
COALESCE(CUENTA_CONTABLE, '') CUENTA_CONTABLE, f.STATUS ESTATUS
FROM ${FACTURAS} f INNER JOIN ${CLIENTES} c ON f.CVE_CLPV = c.CLAVE 
WHERE TRIM(f.CVE_DOC) = ? ORDER BY CVE_DOC`

const SQL_FINDBY_FROM = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, NOMBRE, FOLIO, SERIE, 
(SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as DESCRIPCION,
SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, NUM_MONED AS MONEDA, TIPCAMB AS TIPO_CAMBIO, ROUND(CAN_TOT, 2) IMPORTE, ROUND(IMP_TOT4, 2) AS IVA, ROUND(IMP_TOT3, 2) AS IEPS, f.STATUS ESTATUS, ROUND(IMPORTE, 2) AS TOTAL
FROM ${FACTURAS} f INNER JOIN ${CLIENTES} c ON f.CVE_CLPV = c.CLAVE 
WHERE f.FECHA_DOC >= ? AND f.ACT_COI = 'N' AND f.STATUS = 'E' ORDER BY CVE_DOC`

const SQL_FINDBY_FROM_TO = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, NOMBRE, FOLIO, SERIE, 
(SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as DESCRIPCION,
SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, NUM_MONED AS MONEDA, TIPCAMB AS TIPO_CAMBIO, ROUND(CAN_TOT, 2) IMPORTE, ROUND(IMP_TOT4, 2) AS IVA, ROUND(IMP_TOT3, 2) AS IEPS, f.STATUS ESTATUS, ROUND(IMPORTE, 2) AS TOTAL
FROM ${FACTURAS} f INNER JOIN ${CLIENTES} c ON f.CVE_CLPV = c.CLAVE 
WHERE f.FECHA_DOC >= ? AND f.FECHA_DOC <= ? AND f.ACT_COI = 'N' AND f.STATUS = 'E' ORDER BY CVE_DOC`

const SQL_FINDBY_FROM_TO_IDS = `SELECT TRIM(CVE_DOC) CVE_DOC
FROM ${FACTURAS} f
WHERE f.FECHA_DOC >= ? AND f.FECHA_DOC <= ? AND f.ACT_COI = 'N' AND f.STATUS = 'E' ORDER BY CVE_DOC`

const SQL_FINDBY_DATE = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, NOMBRE, FOLIO, SERIE, 
(SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as DESCRIPCION,
SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, NUM_MONED AS MONEDA, TIPCAMB AS TIPO_CAMBIO, ROUND(CAN_TOT, 2) IMPORTE, ROUND(IMP_TOT4, 2) AS IVA, ROUND(IMP_TOT3, 2) AS IEPS, f.STATUS STATUS, ROUND(IMPORTE, 2) AS TOTAL
FROM ${FACTURAS} f INNER JOIN ${CLIENTES} c ON f.CVE_CLPV = c.CLAVE 
WHERE f.FECHA_DOC = ? AND f.STATUS <> 'C' ORDER BY CVE_DOC`

const SQL_FINDBY_ID_DETAILS = `SELECT TRIM(CVE_DOC) CVE_DOC, NUM_PAR, TRIM(fp.CVE_ART) CVE_ART, DESCR AS descripcion, 
fp.CANT AS CANTIDAD, IMPU4 AS IVA, ROUND(TOTIMP4, 2) AS IMPUESTO, ROUND(TOT_PARTIDA, 2) AS TOTAL_PARTIDA, TIP_CAM AS TIPO_CAMBIO, 
ROUND(COST, 4) AS COSTO, ROUND(s.COSTO_PROM, 4) AS COSTO_PROMEDIO, ROUND(COST * fp.CANT, 2) IMPORTE,
COALESCE(sf.CAMPLIB3, '') AS centro_costos, COALESCE(sf.CAMPLIB2, '') AS LIBRE2,
COALESCE(s.CUENT_CONT, '') AS cuenta_contable
FROM ${FACTURA_PARTIDAS} fp INNER JOIN ${INVENTARIOS} s ON fp.CVE_ART = s.CVE_ART
INNER JOIN ${INVENTARIO_CAMPOLIBRE} sf ON s.CVE_ART = sf.CVE_PROD
WHERE fp.CVE_DOC = ? ORDER BY CVE_DOC`

const SQL_SALES_REPORT = `SELECT TRIM(f.CVE_DOC) CVE_DOC, CLIE01.NOMBRE AS CLIENTE, 
(SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as DESCRIPCION,
i.CVE_ART AS CVE_ART, i.CANT AS CANTIDAD, 
s.DESCR AS DESCRIPCION, c.CAMPLIB2 AS LIBRE2, c.CAMPLIB3 AS LIBRE3, f.NUM_MONED AS MONEDA, f.TIPCAMB AS TIPO_CAMBIO, 
ROUND(i.TOT_PARTIDA, 2) AS TOTAL_PARTIDA, i.IMPU4 AS IVA, ROUND(i.COST, 4) AS COSTO, ROUND(s.COSTO_PROM, 4) AS COSTO_PROMEDIO, ROUND(i.TOTIMP4, 2) AS IMPUESTO, 
ROUND((i.TOT_PARTIDA/f.TIPCAMB), 2) AS TOTAL_USD, SUBSTRING(CAST(f.FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, f.STATUS as STATUS
FROM ((${FACTURAS} f INNER JOIN ${CLIENTES} CLIE01 ON f.CVE_CLPV = CLIE01.CLAVE) 
INNER JOIN (${FACTURA_PARTIDAS} i
INNER JOIN ${INVENTARIOS} s ON i.CVE_ART = s.CVE_ART) 
ON f.CVE_DOC = i.CVE_DOC) 
INNER JOIN ${INVENTARIO_CAMPOLIBRE} c ON s.CVE_ART = c.CVE_PROD
WHERE f.FECHA_DOC>= ? AND f.FECHA_DOC<= ?
ORDER BY f.CVE_DOC`

const message = `Error in query.\n===> Error getting data facturas:\n`

const {promisify} = require('util')
const { stringify } = require('querystring')
const getDocumentById = promisify(getById)
const getItemsById = promisify(getItems)

const sortByCVE_DOC = (data) => {
    const sorted = data.sort(function(a, b){
        const x = a.CVE_DOC.toLowerCase()
        const y = b.CVE_DOC.toLowerCase()
        if(x>y){return 1}
        if(x<y){return -1}
        return 0
    })
    return sorted
}

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if(err){
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
    try{
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID, [id], (err, data) => {
            if(err) {
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getByFrom(from, cb) {

    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_FROM, [from], (err, data) => {
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
const getIds = async (from, to, cb) => {
    try {
        const dbInstance = await getDBInstance()    
        dbInstance.query(SQL_FINDBY_FROM_TO_IDS, [from, to], async (err, data) => {
        //dbInstance.query(SQL_FINDBY_FROM_TO, [from, to], (err, data) => {
            if (err) {
                setImmediate(() => cb(err)) 
            }            
            const ids = JSON.stringify(data)
            //console.log(`base data: ${ids}`)            
            dbInstance.detach()
            setImmediate(() => cb(null, ids))
        })
    } catch(err){
        throw err
    }
}

async function getByFromTo(from, to, cb) {
    try {
        const ids = promisify(getIds)
        await ids(from, to)
        .then((docs) => {
            //console.log(`docs: ${docs}`)
            return getDocumentsItemsById(JSON.parse(docs))
        })            
        .then((result) => {
            //console.log('\n\n\nresult: ' + result)
            setImmediate(() => cb(null, result))
        })
        .catch((err) => {
            setImmediate(() => cb(err))
        })                    
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getBySalesDate(docuemntDate, cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_DATE, [docuemntDate], (err, data) => {
            if (err) {
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

const getDocumentsItemsById = promisify(getDocumentItems)

async function getDocumentItems(ids, cb) {
    try {        
        let response = []
        // console.log(`preparing to complete data: ` + JSON.stringify(ids))
        await Promise.all(ids.map(async (id) =>  {
            // console.log(`working with id: ${id.CVE_DOC}`)
            let element
            await getDocumentById(id.CVE_DOC)
            .then((document) => {
                //console.log(`document ${id}\n` + document)
                document = JSON.parse(document)
                element = document[0]
                // console.log('element: ' + JSON.stringify(element))
                return getItemsById(id.CVE_DOC)
            })
            .then((items) => {
                // console.log(`document items:\n`+JSON.stringify(items))
                element.items=JSON.parse(items)
                //console.log(`element will be: ${JSON.stringify(element)}`)                        
            })
            .catch((err) => {
                console.log(`error getting document at items: ${err}`)
                element = {}
            })
            // console.log(`\nfinishing with: ${id.CVE_DOC} in ${JSON.stringify(element)}`)
            response.push(element)
        })) 
        //console.log(`response is: ${JSON.stringify(response)}`)        
        response = sortByCVE_DOC(response)
        //console.log(`response: ${JSON,stringify(response)}`)
        setImmediate(() => cb(null, JSON.stringify(response)))
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getItems(id, cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID_DETAILS, [id], (err, items) => {
            if (err) {
                setImmediate(() => cb(err))
            }
            items = JSON.stringify(items)            
            dbInstance.detach()
            setImmediate(() => cb(null, items))
        })
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getSalesReport(from, to, cb) {
     
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_SALES_REPORT, [from, to], (err, data) => {            
            if (err) {
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            //console.log(`sales report data: ${data}`)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}
module.exports={
    getAll, getById, getByFrom, getByFromTo, getBySalesDate, getItems, getSalesReport, getDocumentItems
}

