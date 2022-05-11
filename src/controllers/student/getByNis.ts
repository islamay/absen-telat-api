import { RequestHandler } from 'express'
import { ILatenessDocument } from '../../models/lateness'
import SiswaModel, { DocumentBaseDataSiswa } from '../../models/student'

interface Params {
    nis: string
}

interface Body {
    student: DocumentBaseDataSiswa & {
        keterlambatan?: ILatenessDocument[]
    }
}

const getByNis = (): RequestHandler<Params, {}, Body> => {

    return async (req, res, next) => {
        const { student } = req.body
        const secureStudent = student.getDataSiswa()
        if (student.keterlambatan) {
            const latenesses = student.keterlambatan.map(l => l.toObject())
            res.json({ ...secureStudent, keterlambatan: latenesses })
            return;
        }

        res.json(secureStudent)
    }
}

export default getByNis