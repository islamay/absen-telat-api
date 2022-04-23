import { Router } from 'express'
import { body, header } from 'express-validator'
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
import { AccountStatus, AccountType } from '../helpers/accountEnum'
import signOut from '../controllers/student/signOut'
import auth from '../middlewares/auth'
import adminAuth from '../middlewares/adminAuth'
import getStudentByNis from '../middlewares/getStudentByNisMiddleware'
import updateStudentByNis from '../controllers/student/updateStudentByNis'

const createStudentRoute = () => {


    const router = Router()

    router.get('/', getStudent())

    router.post('/',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        auth(AccountType.GURU),
        adminAuth(),
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
                const student = await SiswaModel.findOne({ nis, 'account.status': { $ne: AccountStatus.TIDAK_ADA } })
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

    router.get('/:nis',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa string'),
        validate(),
        auth(AccountType.GURU),
        getByNis()
    )

    router.put('/:nis',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa string'),
        validate(),
        auth(AccountType.GURU),
        getStudentByNis(),
        updateStudentByNis()
    )

    router.delete('/:nis/signout',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        auth(AccountType.SISWA),
        signOut()
    )

    router.post('/:nis/password')

    router.put('/:nis/password',
        changePassword()
    )

    router.post('/:nis/email')

    router.put('/:nis/email')

    return router
}

export default createStudentRoute
