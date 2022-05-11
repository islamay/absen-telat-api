require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime');

import ExcelJS from 'exceljs'
import { ILateness, ILatenessDocument } from '../models/lateness'
import { DocumentBaseDataSiswa } from '../models/student'
import _ from 'lodash';

const excelTable = [
    { header: 'No', key: 'no', width: 30 },
    { header: 'Nama', key: 'nama', width: 30 },
    { header: 'Kelas', key: 'kelas', width: 30 },
    { header: 'Tanggal', key: 'tanggal', width: 30 },
    { header: 'Alasan', key: 'alasan', width: 30 }
]

const borderStyle: Partial<ExcelJS.Border> = { style: 'thin' }

const useDefaultHeaderStyle = (row: ExcelJS.Row) => {
    row.eachCell((cell, colNum) => {
        cell.font = { bold: true }
    })
}

const useDefaultRowStyle = (row: ExcelJS.Row) => {
    row.eachCell((cell, colNum) => {
        cell.border = {
            top: borderStyle,
            right: borderStyle,
            bottom: borderStyle,
            left: borderStyle
        }

        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
        }

    })

    const namaCell = row.getCell('nama')
    namaCell.alignment = { ...namaCell.alignment, wrapText: true }

    const alasanCell = row.getCell('alasan')
    alasanCell.alignment = { ...alasanCell.alignment, wrapText: true }
}

const useDefaultWorksheetStyle = (worksheet: ExcelJS.Worksheet) => {
    worksheet.eachRow((row, rowNum) => {
        if (rowNum === 1) useDefaultHeaderStyle(row)
        useDefaultRowStyle(row)
    })
}

const addKeterlambatanRow = (worksheet: ExcelJS.Worksheet, keterlambatan: (ILateness & { student: DocumentBaseDataSiswa, isViolating: boolean }), no: number) => {
    const row = worksheet.addRow(
        {
            no: no + 1,
            nama: keterlambatan.student.namaLengkap,
            kelas: keterlambatan.student.getFullClass(),
            tanggal: keterlambatan.date,
            alasan: keterlambatan.alasan
        }
    )

    if (keterlambatan.isViolating) {
        const nameCell = row.getCell('nama')
        nameCell.font = {
            color: {
                argb: 'FF0000'
            }
        }
    }
}

const convertToExcel = async (keterlambatanDocuments: (ILatenessDocument & { student: DocumentBaseDataSiswa })[]) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Main')

    worksheet.columns = excelTable

    const duplicate: { [key: string]: number } = {}
    keterlambatanDocuments.forEach(k => {
        if (duplicate[k.nis]) {
            duplicate[k.nis] += 1
        } else {
            duplicate[k.nis] = 1
        }
    })

    const latenesses = keterlambatanDocuments.map(k => {
        if (duplicate[k.nis] >= 3) {
            return { ...k.toObject(), isViolating: true, student: k.student }
        } else {
            return { ...k.toObject(), isViolating: false, student: k.student }
        }
    })

    latenesses.forEach((lateness, index) => {
        addKeterlambatanRow(worksheet, lateness, index)
    })

    useDefaultWorksheetStyle(worksheet)

    return await workbook.xlsx.writeBuffer()
}

export default convertToExcel