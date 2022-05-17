import express, { Request } from 'express'
import { header, body, query } from 'express-validator'
import { AccountType } from '../helpers/accountEnum'
import { authenticate, adminAuth, authIn } from '../middlewares/auth'
import createTeacher from '../controllers/teacher/createTeacher'
import signInTeacher from '../controllers/teacher/signInTeacher'
import validate from '../middlewares/validate'
import pagination from '../middlewares/pagination'
import getTeachers from '../controllers/teacher/get'
import getTeacherById from '../middlewares/getTeacherById'
import patchTeacher from '../controllers/teacher/patchTeacher'
import changePassword from '../controllers/teacher/changePassword'
import Api403Error from '../error/Api403Error'
import requestChangePassword from '../controllers/teacher/requestChangePassword'
import resetPassword from '../controllers/resetPassword'
import putResetPassword from '../controllers/teacher/putResetPassword'


const createRoutes = () => {
    const router = express.Router()

    router.get('/',
        authIn([authenticate(AccountType.GURU, adminAuth)]),
        query('page')
            .optional()
            .isInt().withMessage('Page harus berupa angka'),
        query('limit')
            .optional()
            .isInt().withMessage('Limit harus berupa angka'),
        query('nama')
            .optional()
            .isString().withMessage('Nama harus berupa text'),
        validate(),
        pagination(),
        getTeachers()
    )

    router.post('/',
        authIn([authenticate(AccountType.GURU, adminAuth)]),
        body('nama')
            .notEmpty().withMessage('Nama tidak boleh kosong')
            .isString().withMessage('Nama harus berupa text'),
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong')
            .isEmail().withMessage('Email tidak valid'),
        createTeacher()
    )

    router.post('/signin',
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong')
            .isEmail().withMessage('Email tidak valid'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
            .isString().withMessage('Password harus berupa text'),
        validate(),
        signInTeacher()
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

    router.get('/:id',
        authIn([authenticate(AccountType.GURU, adminAuth), authenticate<{ id: string }>(AccountType.GURU, (req) => {
            if (req.body.auth.teacher._id !== req.params.id) throw new Api403Error('Tidak berhak melihat dokumen')
        })]),
        getTeacherById(true),
    )

    router.patch('/:id',
        authIn([authenticate(AccountType.GURU, adminAuth), authenticate<{ id: string }>(AccountType.GURU, (req) => {
            if (req.body.auth.teacher._id !== req.params.id) throw new Api403Error('Tidak berhak mengubah dokumen')
        })]),
        getTeacherById(),
        patchTeacher()
    )

    router.put('/:id/password',
        authIn([authenticate(AccountType.GURU)]),
        getTeacherById(),
        changePassword()
    )



    return router
}

export default createRoutes