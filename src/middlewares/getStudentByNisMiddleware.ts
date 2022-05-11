import { RequestHandler } from 'express'
import Api404Error from '../error/Api404Error'
import SiswaModel, { DocumentBaseDataSiswa } from '../models/student'

interface Params {
    nis: string
}

interface Query {
    keterlambatan?: 'true' | 'false'
}

export interface BodyAfterGetStudentByNis {
    student: DocumentBaseDataSiswa
}

const getStudentByNis = (): RequestHandler<Params, {}, BodyAfterGetStudentByNis, Query> => {

    return async (req, res, next) => {
        const { nis } = req.params
        const { keterlambatan: lateness } = req.query


        try {
            const student = await SiswaModel.findOne({ nis })
            if (!student) throw new Api404Error('Siswa tidak ditemukan')
            if (lateness === 'true') {
                await student.populate('keterlambatan')
            }
            req.body.student = student
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default getStudentByNis