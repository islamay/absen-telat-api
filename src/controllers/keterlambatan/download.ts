import { RequestHandler } from 'express'
import { findByDate } from '../../services/lateness'


interface Query {
    start: string,
    end?: string
}

const download = (): RequestHandler<{}, {}, {}, Query> => {

    return (req, res, next) => {
        const { start, end } = req.query
        const startDate = new Date(start)
        const endDate = end ? new Date(end) : new Date()

        try {


            const keterlambatanDocuments = await findByDate({ startDate, endDate })
            console.log(keterlambatanDocuments);

            const fileBuffer = await convertToExcel(keterlambatanDocuments)
            const fileSize = Buffer.from(fileBuffer).length

            res.set('Content-disposition', 'attachment; filename=' + 'data-keterlambatan.xlsx')
            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.set('Content-Length', fileSize.toString())

            const readStream = new Stream.PassThrough()
            readStream.end(fileBuffer, 'base64')
            readStream.pipe(res)
        } catch (error) {
            next(error)
        }
    }
}