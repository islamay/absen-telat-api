import { RequestHandler } from 'express'
import SiswaModel, { DataSiswa } from '../../models/dataSiswa'

type Body = Omit<DataSiswa, 'kelasString' | 'fullClass' | 'account'>

const postStudent = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { nis, namaLengkap, kelas, kelasNo, jurusan } = req.body

        try {
            const student = await SiswaModel.createSiswa({ nis, namaLengkap, kelas, kelasNo, jurusan })
            res.type('application/json')
            res.json(student)
        } catch (error) {
            next(error)
        }
    }
}

export default postStudent
