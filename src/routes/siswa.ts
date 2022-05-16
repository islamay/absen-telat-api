import { Router } from 'express'
import { body, header, query } from 'express-validator'
import postStudent from '../controllers/student/post'
import getStudent from '../controllers/student/get'
import getByNis from '../controllers/student/getByNis'
import studentSignIn from '../controllers/student/signIn'
import changePassword from '../controllers/student/changePassword'
import SiswaModel, { Jurusan } from '../models/student'
import validate from '../middlewares/validate'
import { AccountStatus, AccountType } from '../helpers/accountEnum'
import signOut from '../controllers/student/signOut'
import { authenticate, adminAuth, authIn } from '../middlewares/auth'
import getStudentByNis from '../middlewares/getStudentByNisMiddleware'
import patchStudent from '../controllers/student/patch'
import Api401Error from '../error/Api401Error'
import Api403Error from '../error/Api403Error'
import requestChangePassword from '../controllers/student/requestChangePassword'
import resetPassword from '../controllers/resetPassword'
import putResetPassword from '../controllers/student/putResetPassword'


const createStudentRoute = () => {


    const router = Router()

    router.get('/',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate(AccountType.GURU)]),
        getStudent()
    )

    router.post('/',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate(AccountType.GURU)]),
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

    router.post('/request-reset-password',
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong')
            .isString().withMessage('Email harus berupa text')
            .isEmail().withMessage('Email tidak valid'),
        validate(),
        requestChangePassword()
    )

    router.get('/reset-password', resetPassword())

    router.post('/reset-password', putResetPassword())

    router.get('/:nis',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa string'),
        validate(),
        authIn([authenticate(AccountType.GURU), authenticate<{ nis: string }>(AccountType.SISWA, req => {
            if (req.params.nis !== req.body.auth.student.nis) throw new Api401Error('Bukan pemilik dokumen')
        })]),
        getStudentByNis(),
        getByNis()
    )

    router.patch('/:nis',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa string'),
        validate(),
        authIn([authenticate(AccountType.SISWA), authenticate(AccountType.GURU, adminAuth)]),
        getStudentByNis(),
        patchStudent()
    )

    router.delete('/:nis/signout',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate(AccountType.SISWA)]),
        signOut()
    )

    router.put('/:nis/password',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate<{ nis: string }>(AccountType.SISWA, (req) => {
            if (req.params.nis !== req.body.auth.student.nis) {
                throw new Api403Error('Tidak berhak mengubah dokumen')
            }
        })]),
        changePassword()
    )

    return router
}

export default createStudentRoute
