import { RequestHandler } from 'express'
import LatenessModel, { ILatenessDocument } from '../../models/lateness'
import { findByDate } from '../../services/lateness'
import toExcel from '../../helpers/keterlambatanExcel'
import { DocumentBaseDataSiswa } from '../../models/student'
import _ from 'lodash'
import convertToExcel from '../../helpers/keterlambatanExcel'
import { Stream } from 'stream'

interface Query {
    start: Date,
    end: Date
}

const downloadLatenesses = (): RequestHandler<{}, {}, {}, Query> => {

    return async (req, res, next) => {
        const { start, end } = req.query

        try {

            // @ts-ignore
            const latenesses: (ILatenessDocument & { student: DocumentBaseDataSiswa })[] = await LatenessModel.find({
                date: {
                    $gte: start,
                    $lte: end
                }
            }).populate('student').exec()

            const sortedLatenesses = _.orderBy(latenesses, [
                l => l.student.kelas,
                l => l.student.fullClass,
                l => l.student.namaLengkap
            ], ['asc', 'asc', 'asc'])

            const fileBuffer = await convertToExcel(sortedLatenesses)
            const fileSize = Buffer.from(fileBuffer).length
            const readStream = new Stream.PassThrough()

            // res.writeHead(200, {
            //     'Content-disposition': 'attachment; filename=' + 'data-keterlambatan.xlsx',
            //     'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            //     'Content-Length': fileSize.toString()
            // })
            res.set('Content-disposition', 'attachment; filename=' + 'data-keterlambatan.xlsx')
            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.set('Content-Length', fileSize.toString())
            readStream.end(fileBuffer, 'base64')
            readStream.pipe(res)
            // console.log(fileBuffer);

            // res.json({ ok: 'ok' })

        } catch (error) {
            next(error)
        }
    }
}

export default downloadLatenesses