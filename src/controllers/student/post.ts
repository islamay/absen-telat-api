import { RequestHandler } from 'express'
import SiswaModel, { DataSiswa } from '../../models/student'
import { CreateStudent, createStudent } from '../../services/student'

type Body = CreateStudent

const postStudent = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { nis, namaLengkap, kelas, kelasNo, jurusan, email } = req.body

        try {
            const student = await createStudent({
                nis,
                namaLengkap,
                kelas,
                kelasNo,
                jurusan,
                email
            })
            res.type('application/json')
            res.json(student)
        } catch (error) {
            next(error)
        }
    }
}

export default postStudent
