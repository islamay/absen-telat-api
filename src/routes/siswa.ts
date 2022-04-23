import { Router } from 'express'
import { body } from 'express-validator'
import postStudent from '../controllers/student/post'
import getStudent from '../controllers/student/get'
import getByNis from '../controllers/student/getByNis'
import studentSignIn from '../controllers/student/signIn'
import studentSignUp from '../controllers/student/signUp'
import changePassword from '../controllers/student/changePassword'
import requestChangePassword from '../controllers/student/requestChangePassword'
import verifyChangePassword from '../controllers/student/verifyChangePassword'
import SiswaModel, { Jurusan } from '../models/dataSiswa'
import validate from '../middlewares/validate'
import { accountStatus } from '../helpers/accountEnum'

const createStudentRoute = () => {


    const router = Router()

    router.get('/', getStudent())

    router.post('/',
        body('nis')
            .notEmpty().withMessage('Nis tidak boleh kosong')
            .isString().withMessage('Nis harus berupa text')
            .custom(async (nis: string) => {
                const student = await SiswaModel.findOne({ nis })
                if (student) throw new Error('Nis telah terpakai')
            }),
        body('namaLengkap')
            .notEmpty().withMessage('Nama tidak boleh kosong')
            .isString().withMessage('Nama harus berupa text'),
        body('kelas')
            .notEmpty().withMessage('Kelas tidak boleh kosong')
            .isInt().withMessage('Kelas harus berupa angka')
            .isInt({ min: 10, max: 14 }).withMessage('Kelas harus berupa angka 10 sampai 14'),
        body('kelasNo')
            .notEmpty().withMessage('Nomor kelas tidak boleh kosong')
            .isInt().withMessage('Nomor kelas harus berupa angka')
            .isInt({ min: 1, max: 3 }).withMessage('Nomor kelas harus berupa angka 1 sampai 3'),
        body('jurusan')
            .notEmpty().withMessage('Jurusan tidak boleh kosong')
            .isIn(Object.values(Jurusan)).withMessage('Jurusan tidak valid'),
        validate(),
        postStudent()
    )

    router.post('/signin',
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong')
            .isString().withMessage('Email harus berupa text')
            .isEmail().withMessage('Email tidak valid'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
            .isString().withMessage('Password harus berupa text'),
        validate(),
        studentSignIn()
    )

    router.post('/signup',
        body('nis')
            .notEmpty().withMessage('Nis tidak boleh kosong')
            .isString().withMessage('Nis harus berupa text')
            .custom(async (nis: string) => {
                const student = await SiswaModel.findOne({ nis, 'account.status': { $ne: accountStatus.TIDAK_ADA } })
                if (student) throw new Error('Nis telah memiliki akun')
            }),
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong')
            .isString().withMessage('Email harus berupa text')
            .isEmail().withMessage('Email tidak valid')
            .custom(async (email: string) => {
                const student = await SiswaModel.findOne({ 'account.email': email })
                if (student) throw new Error('Email telah terpakai')
            }),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
            .isString().withMessage('Password harus berupa text'),
        validate(),
        studentSignUp()
    )

    router.post('/permintaan-ganti-password',
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong')
            .isString().withMessage('Email tidak valid'),
        validate(),
        requestChangePassword()
    )

    router.post('/verifikasi-ganti-password',
        verifyChangePassword()
    )

    router.get('/:nis', getByNis())

    router.put('/:nis',)

    router.post('/:nis/password')


    router.put('/:nis/password',
        changePassword()
    )

    router.post('/:nis/email')

    router.put('/:nis/email')

    return router
}

export default createStudentRoute
