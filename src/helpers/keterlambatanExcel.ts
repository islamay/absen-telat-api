require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime');

import ExcelJS from 'exceljs'
import { ITelatDocument } from '../models/keterlambatan'
import { DocumentBaseDataSiswa } from '../models/dataSiswa'
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

const addKeterlambatanRow = (worksheet: ExcelJS.Worksheet, keterlambatan: ITelatDocument & { siswa: DocumentBaseDataSiswa }, no: number) => {


    worksheet.addRow(
        {
            no: no + 1,
            nama: keterlambatan.siswa.namaLengkap,
            kelas: keterlambatan.siswa.getFullClass(),
            tanggal: keterlambatan.date,
            alasan: keterlambatan.alasan
        }
    )

}

const sortKeterlambatan = (keterlambatanDocuments: ITelatDocument[]) => {
    // @ts-ignore
    return _.sortBy(keterlambatanDocuments, doc => doc.siswa.getFullClass())
}

const convertToExcel = async (keterlambatanDocuments: ITelatDocument[]) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Main')

    worksheet.columns = excelTable

    const sortedKeterlambatan = sortKeterlambatan(keterlambatanDocuments)

    sortedKeterlambatan.map((keterlambatanDocument, index) => {
        addKeterlambatanRow(worksheet, <ITelatDocument & { siswa: DocumentBaseDataSiswa }>keterlambatanDocument, index)
    })

    useDefaultWorksheetStyle(worksheet)

    return await workbook.xlsx.writeBuffer()
}

export default convertToExcel