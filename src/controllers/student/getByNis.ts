import { RequestHandler } from 'express'
import SiswaModel from '../../models/dataSiswa'

interface Params {
    nis: string
}

const getByNis = (): RequestHandler<Params> => {

    return async (req, res, next) => {
        const { nis } = req.params
        try {
            const student = await SiswaModel.findOne({ nis })
            res.type('application/json')
            res.json(student)
        } catch (error) {
            next(error)
        }
    }
}

export default getByNis