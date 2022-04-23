import { RequestHandler } from 'express'
import Api404Error from '../error/Api404Error'
import SiswaModel, { DocumentBaseDataSiswa } from '../models/dataSiswa'

interface Params {
    nis: string
}

export interface BodyAfterGetStudentByNis {
    student: DocumentBaseDataSiswa
}

const getStudentByNis = (): RequestHandler<Params, {}, BodyAfterGetStudentByNis> => {

    return async (req, res, next) => {
        const { nis } = req.params

        try {
            const student = await SiswaModel.findOne({ nis })
            if (!student) throw new Api404Error('Siswa tidak ditemukan')
            req.body.student = student
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default getStudentByNis