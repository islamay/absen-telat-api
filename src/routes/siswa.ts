import { Router } from 'express'
import { body } from 'express-validator'
import postStudent from '../controllers/student/post'
import getStudent from '../controllers/student/get'
import SiswaModel, { Jurusan } from '../models/dataSiswa'
import validate from '../middlewares/validate'

const createStudentRoute = () => {


    const router = Router()

    router.get('/', getStudent())

    router.post('/',
        body('nis')
            .notEmpty()
            .withMessage('Nis tidak boleh kosong')
            .isString()
            .withMessage('Nis harus berupa text')
            .custom(async (nis: string) => {
                const student = await SiswaModel.findOne({ nis })
                if (student) throw new Error('Nis telah terpakai')
            }),
        body('namaLengkap')
            .notEmpty()
            .withMessage('Nama tidak boleh kosong')
            .isString()
            .withMessage('Nama harus berupa text'),
        body('kelas')
            .notEmpty()
            .withMessage('Kelas tidak boleh kosong')
            .isInt()
            .withMessage('Kelas harus berupa angka')
            .isInt({ min: 10, max: 14 })
            .withMessage('Kelas harus berupa angka 10 sampai 14'),
        body('kelasNo')
            .notEmpty()
            .withMessage('Nomor kelas tidak boleh kosong')
            .isInt()
            .withMessage('Nomor kelas harus berupa angka')
            .isInt({ min: 1, max: 3 })
            .withMessage('Nomor kelas harus berupa angka 1 sampai 3'),
        body('jurusan')
            .notEmpty()
            .withMessage('Jurusuan tidak boleh kosong')
            .isIn(Object.values(Jurusan))
            .withMessage('Jurusan tidak valid'),
        validate(),
        postStudent()
    )

    router.get('/:nis',)

    router.put('/:nis',)

    router.post('/signin',)

    router.post('/signup',)

    router.post('/:nis/password')

    router.put('/:nis/password')

    router.post('/:nis/email')

    router.put('/:nis/email')

    return router
}

export default createStudentRoute
