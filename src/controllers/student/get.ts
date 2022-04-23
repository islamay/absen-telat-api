import { RequestHandler } from 'express'
import SiswaModel from '../../models/dataSiswa'
import { WithPagination } from '../../middlewares/pagination'

type Body = WithPagination

interface Query {
    nama?: string
}

const getStudent = (): RequestHandler<{}, {}, Body, Query> => {

    return async (req, res, next) => {
        const withName = !!req.query.nama
        const { limit, startIndex } = req.body

        try {
            const students = withName
                ? await SiswaModel.find({ namaLengkap: req.query.nama }).skip(startIndex).limit(limit)
                : await SiswaModel.find().skip(startIndex).limit(limit)

            res.type('application/json')
            res.json(students)
        } catch (error) {
            next(error)
        }
    }
}

export default getStudent
