import { RequestHandler } from 'express'
import SiswaModel from '../../models/dataSiswa'

interface Params {
    nis: string
}

interface Query {
    keterlambatan?: boolean
}

const getByNis = (): RequestHandler<Params, {}, {}, Query> => {

    return async (req, res, next) => {
        const { nis } = req.params
        const { keterlambatan = null } = req.query
        try {
            const student = await SiswaModel.findOne({ nis })
            if (keterlambatan) {
                await student.populate({ path: 'keterlambatan' })
                console.log(student);
            }
            res.type('application/json')
            res.json(student)
        } catch (error) {
            next(error)
        }
    }
}

export default getByNis