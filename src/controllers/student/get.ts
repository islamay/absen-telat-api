import { RequestHandler } from 'express'
import SiswaModel, { Jurusan } from '../../models/student'
import { WithPagination } from '../../middlewares/pagination'

type Body = WithPagination

interface Query {
    nama?: string
    kelas?: string
    jurusan?: string
}

const getStudent = (): RequestHandler<{}, {}, Body, Query> => {

    return async (req, res, next) => {
        const { nama = '' } = req.query
        const { limit, startIndex } = req.body
        const withName = !!nama
        let withClass = false
        let withJurusan = false
        let classArray: number[], majors: string[]

        try {
            const jurusan = req.query.jurusan ? JSON.parse(req.query.jurusan) : ''
            const kelas = req.query.kelas ? JSON.parse(req.query.kelas) : ''

            if (Array.isArray(kelas)) {
                const isValidKelas = kelas.every(v => typeof v === 'number')
                if (isValidKelas) {
                    withClass = true
                    classArray = kelas
                }
            }

            if (Array.isArray(jurusan)) {
                const isValidMajor = jurusan.every(v => typeof v === 'string')
                if (isValidMajor) {
                    majors = jurusan
                }
            }
        } catch (error) {

        }


        const query = {}
        if (withName) Object.assign(query, { namaLengkap: { $regex: nama, $options: 'i' } })
        if (withClass) Object.assign(query, { kelas: { $in: classArray } })
        if (withJurusan) Object.assign(query, { jurusan: { $in: majors } })


        try {
            const students = (await SiswaModel.find(query).skip(startIndex).limit(limit)).map(s => s.getDataSiswa())

            res.type('application/json')
            res.json(students)
        } catch (error) {
            next(error)
        }
    }
}

export default getStudent
