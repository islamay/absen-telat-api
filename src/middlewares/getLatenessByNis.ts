import { RequestHandler } from 'express'
import LatenessModel, { ILatenessDocument } from '../models/lateness'
import { WithPagination } from '../middlewares/pagination'

export interface Params {
    nis: string
}

export interface Query {
    tahun?: number,
    bulan?: number
}

export interface BodyAfterGetLatenessByNis extends WithPagination {
    latenesses: ILatenessDocument[]
}

const getLatenessByNis = (sendResponse: boolean): RequestHandler<Params, {}, BodyAfterGetLatenessByNis, Query> => {
    return async (req, res, next) => {
        const currentDate = new Date()
        const { nis = '' } = req.params
        const { limit, startIndex } = req.body
        const { bulan: month = currentDate.getMonth(), tahun: year = currentDate.getFullYear() } = req.query
        const dateFilterStart = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const dateFilterEnd = new Date(year, month, lastDay.getDate())


        try {
            const latenesses = await LatenessModel.find({
                nis,
                date: { $gte: dateFilterStart, $lte: dateFilterEnd }
            }).skip(startIndex).limit(limit).exec()
            req.body.latenesses = latenesses

            if (sendResponse) {
                res.type('application/json')
                res.json(latenesses)
                return;
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

export default getLatenessByNis
