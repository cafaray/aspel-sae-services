'use strict'

const {getDBInstance} = require('../connection')
const {COMPRAS, COMPRA_PARTIDAS, LIMIT, PROVEEDORES, INVENTARIOS, INVENTARIO_CAMPOLIBRE} = require('../../configs/config')
const {promisify} = require('util')
const SQL_FIND_ALL=`SELECT ${LIMIT} CVE_DOC, CVE_CLPV, SERIE, FOLIO, p.NOMBRE AS proveedor, SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, TIPCAMB AS tipo_cambio, IMPORTE, NUM_MONED AS moneda, IMP_TOT4 AS impuesto  
                    FROM ${COMPRAS} c INNER JOIN ${PROVEEDORES} p ON c.CVE_CLPV = p.CLAVE ORDER BY FECHA_DOC desc`
const SQL_FINDBY_FROM = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, SERIE, FOLIO,  
                    p.NOMBRE AS proveedor, SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, TIPCAMB AS tipo_cambio, IMPORTE, NUM_MONED AS moneda, IMP_TOT4 AS impuesto 
                    FROM ${COMPRAS} c INNER JOIN ${PROVEEDORES} p ON c.CVE_CLPV = p.CLAVE 
                    WHERE c.FECHA_DOC >= ? AND c.ACT_COI = 'N' AND c.STATUS = 'E' ORDER BY c.FECHA_DOC`    
const SQL_FINDBY_FROM_TO = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, SERIE, FOLIO,  
                    p.NOMBRE AS proveedor, SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, TIPCAMB AS tipo_cambio, ROUND(IMPORTE, 2) IMPORTE, NUM_MONED AS moneda, ROUND(IMP_TOT4, 2) AS IMPUESTO,
                    '' as cuenta, '' as departamento, '' as centro_costos, (SERIE || '-'  || CAST(FOLIO AS VARCHAR(9))) as descripcion
                    FROM ${COMPRAS} c INNER JOIN ${PROVEEDORES} p ON c.CVE_CLPV = p.CLAVE 
                    WHERE c.FECHA_DOC >= ? AND c.FECHA_DOC <= ? ORDER BY c.FECHA_DOC AND c.ACT_COI = 'N' AND c.STATUS = 'E' `
const SQL_FIND__DETAILSBY_FROM_TO = `SELECT TRIM(c.CVE_DOC) CVE_DOC, TRIM(c.CVE_CLPV) CVE_CLPV, c.SERIE, c.FOLIO,  
                    p.NOMBRE AS proveedor, SUBSTRING(CAST(c.FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, c.TIPCAMB AS tipo_cambio, ROUND(c.IMPORTE, 2) AS IMPORTE, c.NUM_MONED AS moneda, ROUND(c.IMP_TOT4, 2) AS impuesto_documento,  
                    i.NUM_PAR AS numero_partida, i.CVE_ART AS clave_articulo, i.IMPU4 AS impuesto_tasa, ROUND(TOTIMP4, 2) AS IMPUESTO, ROUND(i.TOT_PARTIDA, 2) as total, i.TIP_CAM as tipo_cambio, 
                    COALESCE(sf.CAMPLIB3, '') AS centro_costos, COALESCE(s.CUENT_CONT, '') AS cuenta_contable, COALESCE(s.DESCR, '') AS DESCRIPCION
                    FROM ${COMPRA_PARTIDAS} i INNER JOIN ${COMPRAS} c ON c.CVE_DOC = i.CVE_DOC
                    INNER JOIN ${PROVEEDORES} p ON c.CVE_CLPV = p.CLAVE  
                    INNER JOIN ${INVENTARIOS} s ON i.CVE_ART = s.CVE_ART 
                    INNER JOIN ${INVENTARIO_CAMPOLIBRE} sf ON i.CVE_ART = sf.CVE_PROD
                    WHERE c.FECHA_DOC >= ? AND c.FECHA_DOC <= ? ORDER BY c.FECHA_DOC`
const SQL_FIND__DETAILSBY_DOCUCMENT = `SELECT TRIM(CVE_DOC) CVE_DOC, TRIM(CVE_CLPV) CVE_CLPV, SERIE, FOLIO,  
                    p.NOMBRE AS proveedor, SUBSTRING(CAST(FECHA_DOC AS VARCHAR(24)) FROM 1 FOR 10) AS FECHA_DOC, TIPCAMB AS tipo_cambio, IMPORTE, NUM_MONED AS moneda, IMP_TOT4 AS impuesto  
                    FROM ${COMPRAS} c INNER JOIN ${PROVEEDORES} p ON c.CVE_CLPV = p.CLAVE 
                    WHERE trim(c.CVE_DOC) = trim(?)`
const SQL_FIND__ITEMSSBY_DOCUCMENT = `SELECT i.NUM_PAR AS numero_partida, i.CVE_ART AS clave_articulo, i.IMPU4 AS impuesto, 
                    i.TOT_PARTIDA as total, i.TIP_CAM as tipo_cambio, sf.CAMPLIB3 AS centro_costos, s.CUENT_CONT AS cuenta_contable, s.DESCR AS producto
                    FROM ${COMPRA_PARTIDAS} i INNER JOIN ${INVENTARIOS} s ON i.CVE_ART = s.CVE_ART 
                         INNER JOIN ${INVENTARIO_CAMPOLIBRE} sf ON i.CVE_ART = sf.CVE_PROD
                    WHERE trim(i.CVE_DOC) = trim(?)`

const addTaxRecord = promisify(addDebeHaber)

async function getAll(cb) {
    const message = "Error querying data!\n===> Error getting data compras.getAll:\n"
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            //console.log(`data: ${data}`)
            setImmediate(() => cb(null, JSON.stringify(data)))
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getFrom(docsFrom, cb) {
    const message = "Error querying data!\n===> Error getting data compras.getFrom:\n"
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_FROM, [docsFrom], (err, data) => {
            if(err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, JSON.stringify(data)))
        })
    } catch (err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function addDebeHaber(data, isProveedor, cb) {
    try {
        let impuesto = 0
        let newdoc = {}
        const context = isProveedor?"Proveedor":"Documento"            
        const dateOptions = {year: 'numeric', month: 'numeric', day: 'numeric'}
        if (data && Array.isArray(data)){
            data.map(document => {
                console.log(JSON.stringify(document))
                impuesto = impuesto + document.IMPUESTO
            })
            console.log(`Sum of impuesto = ${impuesto}`)
            newdoc = {
                DESCRIPCION:`Impuesto al valor agregado (IVA) ${context}`,
                FECHA_DOC: new Date().toLocaleString('es-MX', dateOptions),
                MONEDA: 1,
                TIPO_CAMBIO: 1.0,
                IMPORTE: impuesto
            }
        } else {
            newdoc = {
                DESCRIPCION:`Impuesto al valor agregado (IVA) ${context}`,
                FECHA_DOC: new Date().toLocaleString('es-MX', dateOptions),
                MONEDA: 1,
                TIPO_CAMBIO: 1.0,
                IMPORTE: 0
            }
        }    
        data.push(newdoc)
        console.log(`data compras: ${data}`)
        setImmediate(() => cb(null, data))
    } catch(err) {
        console.log(`Error adding DebeHaber record: ${err}`)
        setImmediate(() => cb(err))
    }

}

async function getFromTo(docsFrom, docsTo, cb) {
    const message = "Error querying data!\n===> Error getting data compras.getFromTo:\n"    
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_FROM_TO, [docsFrom, docsTo], async (err, data) => {
            if (err) {
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            console.log(`data: ${Array.isArray(data)}`)
            if (data && Array.isArray(data)){
                await addTaxRecord(data, true)
                .then((data) => {
                    setImmediate(() => cb(null, JSON.stringify(data)))
                })
                .catch((err) => {
                    console.log(`${message}${err}`)
                    setImmediate(() => cb(err))
                })
            } else {
                data = []
                setImmediate(() => cb(null, JSON.stringify(data)))
            }            
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
} 

async function getFromToDetails(docsFrom, docsTo, cb) {
    const message = "Error querying data!\n===> Error getting data compras.getDetails:\n"
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND__DETAILSBY_FROM_TO, [docsFrom, docsTo], async (err, data) => {
            if(err) {
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            //console.log(`data: ${data}`)
            if (data && Array.isArray(data)){
                await addTaxRecord(data, false)
                .then((data) => {
                    setImmediate(() => cb(null, JSON.stringify(data)))
                })
                .catch((err) => {
                    console.log(`${message}${err}`)
                    setImmediate(() => cb(err))
                })
            } else {
                data = []
                setImmediate(() => cb(null, JSON.stringify(data)))
            }      
            //setImmediate(() => cb(null, JSON.stringify(data)))
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getDocument(cveDocument, cb) {
    const message = "Error querying data!\n===> Error getting data compras.getDocument:\n"
    console.log(`===> query to execute: ${SQL_FIND__DETAILSBY_DOCUCMENT}`)
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND__DETAILSBY_DOCUCMENT, [cveDocument], (err, data) => {
            if(err) {
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            console.log(`data: ${JSON.stringify(data)}`)
            setImmediate(() => cb(null, JSON.stringify(data)))
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

async function getItems(cveDocument, cb) {
    const message = "Error querying data!\n===> Error getting data compras.getItems:\n"    
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND__ITEMSSBY_DOCUCMENT, [cveDocument], (err, data) => {
            if(err) {
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }
            console.log(`data: ${data}`)
            setImmediate(() => cb(null, JSON.stringify(data)))
        })
    } catch(err) {
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))
    }
}

module.exports={
    getAll,
    getFrom,
    getFromTo,
    getFromToDetails,
    getDocument,
    getItems
}
