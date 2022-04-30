import { RequestHandler } from 'express'
import { WithPagination } from '../../middlewares/pagination'
import LatenessModel from '../../models/lateness'

type Body = WithPagination;

const getLateness = (): RequestHandler<{}, {}, Body, {}> => {

    return async (req, res, next) => {
        const { limit, startIndex } = req.body
        try {
            const latenesses = await LatenessModel.find().sort('date').skip(startIndex).limit(limit).exec()
            res.type('application/json')
            res.json({ keterlambatan: latenesses })
        } catch (error) {
            next(error)
        }
    }
}

export default getLateness