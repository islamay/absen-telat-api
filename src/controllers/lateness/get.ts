import { RequestHandler } from 'express'
import { WithPagination } from '../../middlewares/pagination'
import LatenessModel from '../../models/lateness'

type Body = WithPagination;

interface Query {
    nis: string,
    start?: Date,
    end?: Date
}

const getLateness = (): RequestHandler<{}, {}, Body, Query> => {

    return async (req, res, next) => {
        const { limit, startIndex } = req.body

        try {
            const latenesses = await LatenessModel.find().sort('date').skip(startIndex).limit(limit).exec()
            res.type('application/json')
            res.json({ keterlambatan: latenesses })
            latenesses.forEach(l => console.log(l.alasan))

        } catch (error) {
            next(error)
        }
    }
}

export default getLateness