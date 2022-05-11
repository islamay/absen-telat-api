import { RequestHandler } from 'express'
import Api404Error from '../error/Api404Error'
import LatenessModel, { ILatenessDocument } from '../models/lateness'
import { BodyAfterAuth } from '../middlewares/auth'

export interface ParamsForGetLatenessById {
    id: string
}

export interface BodyAfterGetLatenessById {
    lateness: ILatenessDocument
}

const getLatenessById = (send?: boolean): RequestHandler<ParamsForGetLatenessById, {}, BodyAfterGetLatenessById> => {

    return async (req, res, next) => {
        const { id } = req.params
        try {
            const lateness = await LatenessModel.findOne({ _id: id })
            if (!lateness) throw new Api404Error('Data tidak ditemukan')

            req.body.lateness = lateness

            if (send) {
                res.json(lateness)

                return;
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default getLatenessById