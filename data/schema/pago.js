'use strict'

const {getDBInstance} = require('../connection')
const {PAGOS, LIMIT, CONCEPTOS, PROVEEDORES, FOLIOS} = require('../../configs/config')
const SQL_FIND_ALL = `SELECT ${LIMIT} trim(p.CVE_PROV) CVE_PROV, s.NOMBRE, s.RFC, p.NUM_CARGO, 
    c.DESCR, trim(p.REFER) REFER, trim(p.DOCTO) DOCTO, 
    SUBSTRING(CAST(p.FECHA_APLI AS VARCHAR(24)) FROM 1 FOR 10) FECHA_APLI,
    SUBSTRING(CAST(p.FECHAELAB AS VARCHAR(24)) FROM 1 FOR 10) FECHAELAB,
    f.IMPUESTO1, f.IMPUESTO2, f.IMPUESTO3, f.IMPUESTO4, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3) AS IMPUESTOS, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3 - f.IMPUESTO4 + p.IMPORTE) AS IMPORTE, 
    c.NUM_CPTO, c.TIPO, c.CUEN_CONT, p.AFEC_COI, p.CTLPOL, p.CVE_AUT, p.CVE_BITA, trim(p.CVE_FOLIO) CVE_FOLIO, p.CVE_OBS, p.ENTREGADA, 
    p.FECHA_ENTREGA, p.FECHA_VENC, p.IMPMON_EXT, trim(p.NO_FACTURA) NO_FACTURA, p.NUM_MONED, p.REF_SIST, p.SIGNO, p.STATUS, p.TCAMBIO, p.TIPO_MOV, p.USUARIO
FROM ${PAGOS} p INNER JOIN ${CONCEPTOS} c ON p.NUM_CPTO = c.NUM_CPTO
    INNER JOIN ${PROVEEDORES} s ON p.CVE_PROV = s.CLAVE
    INNER JOIN ${FOLIOS} f ON p.CVE_FOLIO = f.CVE_FOLIO`

    const SQL_FINDBY_DATE_NOACCOUNTABLE = `SELECT trim(p.CVE_PROV) CVE_PROV, s.NOMBRE, s.RFC, p.NUM_CARGO, 
    c.DESCR, trim(p.REFER) REFER, trim(p.DOCTO) DOCTO, 
    SUBSTRING(CAST(p.FECHA_APLI AS VARCHAR(24)) FROM 1 FOR 10) FECHA_APLI,
    SUBSTRING(CAST(p.FECHAELAB AS VARCHAR(24)) FROM 1 FOR 10) FECHAELAB,
    f.IMPUESTO1, f.IMPUESTO2, f.IMPUESTO3, f.IMPUESTO4, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3) AS IMPUESTOS, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3 - f.IMPUESTO4 + p.IMPORTE) AS IMPORTE, 
    c.NUM_CPTO, c.TIPO, c.CUEN_CONT, p.AFEC_COI, p.CTLPOL, p.CVE_AUT, p.CVE_BITA, trim(p.CVE_FOLIO) CVE_FOLIO, p.CVE_OBS, p.ENTREGADA, 
    p.FECHA_ENTREGA, p.FECHA_VENC, p.IMPMON_EXT, trim(p.NO_FACTURA) NO_FACTURA, p.NUM_MONED, p.REF_SIST, p.SIGNO, p.STATUS, p.TCAMBIO, p.TIPO_MOV, p.USUARIO
FROM ${PAGOS} p INNER JOIN ${CONCEPTOS} c ON p.NUM_CPTO = c.NUM_CPTO
    INNER JOIN ${PROVEEDORES} s ON p.CVE_PROV = s.CLAVE
    INNER JOIN ${FOLIOS} f ON p.CVE_FOLIO = f.CVE_FOLIO
WHERE p.FECHA_APLI >= ? AND p.AFEC_COI <> 'A' AND p.NUM_CPTO NOT IN(1,2,7,9,12,19,20,28) ORDER BY p.FECHA_APLI` 

const SQL_FINDBY_DATE_PROVIDER_NOACCOUNTABLE = `SELECT trim(p.CVE_PROV) CVE_PROV, s.NOMBRE, s.RFC, p.NUM_CARGO, 
    c.DESCR, trim(p.REFER) REFER, trim(p.DOCTO) DOCTO, 
    SUBSTRING(CAST(p.FECHA_APLI AS VARCHAR(24)) FROM 1 FOR 10) FECHA_APLI,
    SUBSTRING(CAST(p.FECHAELAB AS VARCHAR(24)) FROM 1 FOR 10) FECHAELAB,
    f.IMPUESTO1, f.IMPUESTO2, f.IMPUESTO3, f.IMPUESTO4, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3) AS IMPUESTOS, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3 - f.IMPUESTO4 + p.IMPORTE) AS IMPORTE, 
    c.NUM_CPTO, c.TIPO, c.CUEN_CONT, p.AFEC_COI, p.CTLPOL, p.CVE_AUT, p.CVE_BITA, trim(p.CVE_FOLIO) CVE_FOLIO, p.CVE_OBS, p.ENTREGADA, 
    p.FECHA_ENTREGA, p.FECHA_VENC, p.IMPMON_EXT, trim(p.NO_FACTURA) NO_FACTURA, p.NUM_MONED, p.REF_SIST, p.SIGNO, p.STATUS, p.TCAMBIO, p.TIPO_MOV, p.USUARIO
FROM ${PAGOS} p INNER JOIN ${CONCEPTOS} c ON p.NUM_CPTO = c.NUM_CPTO
    INNER JOIN ${PROVEEDORES} s ON p.CVE_PROV = s.CLAVE
    LEFT JOIN ${FOLIOS} f ON p.CVE_FOLIO = f.CVE_FOLIO
WHERE trim(p.CVE_PROV) = ? AND p.FECHA_APLI >= ? AND p.AFEC_COI <> 'A' AND p.NUM_CPTO NOT IN(1,2,7,9,12,19,20,28) ORDER BY p.FECHA_APLI`

const SQL_FINDBY_PROVIDER_NOACCOUNTABLE = `SELECT trim(p.CVE_PROV) CVE_PROV, s.NOMBRE, s.RFC, p.NUM_CARGO, 
    c.DESCR, trim(p.REFER) REFER, trim(p.DOCTO) DOCTO, 
    SUBSTRING(CAST(p.FECHA_APLI AS VARCHAR(24)) FROM 1 FOR 10) FECHA_APLI,
    SUBSTRING(CAST(p.FECHAELAB AS VARCHAR(24)) FROM 1 FOR 10) FECHAELAB,
    f.IMPUESTO1, f.IMPUESTO2, f.IMPUESTO3, f.IMPUESTO4, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3) AS IMPUESTOS, 
    (f.IMPUESTO1 + f.IMPUESTO2 + f.IMPUESTO3 - f.IMPUESTO4 + p.IMPORTE) AS IMPORTE, 
    c.NUM_CPTO, c.TIPO, c.CUEN_CONT, p.AFEC_COI, p.CTLPOL, p.CVE_AUT, p.CVE_BITA, trim(p.CVE_FOLIO) CVE_FOLIO, p.CVE_OBS, p.ENTREGADA, 
    p.FECHA_ENTREGA, p.FECHA_VENC, p.IMPMON_EXT, trim(p.NO_FACTURA) NO_FACTURA, p.NUM_MONED, p.REF_SIST, p.SIGNO, p.STATUS, p.TCAMBIO, p.TIPO_MOV, p.USUARIO
FROM ${PAGOS} p INNER JOIN ${CONCEPTOS} c ON p.NUM_CPTO = c.NUM_CPTO
    INNER JOIN ${PROVEEDORES} s ON p.CVE_PROV = s.CLAVE
    LEFT JOIN ${FOLIOS} f ON p.CVE_FOLIO = f.CVE_FOLIO
WHERE trim(p.CVE_PROV) = ? AND p.NUM_CPTO NOT IN(1,2,7,9,12,19,20,28) ORDER BY p.FECHA_APLI`

const SQL_UPDATE_AFECT_COI = `UPDATE ${PAGOS} SET AFEC_COI = 'A' 
WHERE trim(CVE_PROV) = ? AND trim(REFER) = ? AND NUM_CARGO = ? AND NUM_CPTO = ?
RETURNING CVE_PROV, REFER, NUM_CARGO, NUM_CPTO`

const message = `Error getting data.\n===>Error querying at pagos:\n`

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

async function getUnaccountedByDate(appliedDate, cb) {    
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_DATE_NOACCOUNTABLE, [appliedDate], (err, data) => {
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

async function getUnaccountedByDateProvider(appliedDate, idProvider, cb) {

    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_DATE_PROVIDER_NOACCOUNTABLE, [idProvider, appliedDate], (err, data) => {
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

async function getUnaccountedByProvider(idProvider, cb) {    
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_PROVIDER_NOACCOUNTABLE, [idProvider], (err, data) => {
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

async function setUpgradeCOI(idProvider, reference, idCharge, idConcept, cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_UPDATE_AFECT_COI, [idProvider, reference, idCharge, idConcept], (err, data) => {
            if(err){
                console.log(`${message}${err}`)
                setImmediate(() => cb(err))
            }            
            if (data.REFER) {
                data = JSON.stringify(data)
                console.log(`upgraded data: ${data}`)
                dbInstance.detach()
                setImmediate(() => cb(null, data))
            } else {
                setImmediate(() => cb('Impossible update a non existence record'))
            }
        })
    }catch(err){
        console.log(`${message}${err}`)
        setImmediate(() => cb(err))    
    }
}
module.exports={
    getAll, getUnaccountedByDate, getUnaccountedByDateProvider, setUpgradeCOI, getUnaccountedByProvider
}