import express from 'express'
import { header, body, query } from 'express-validator'
import { AccountType } from '../helpers/accountEnum'
import auth, { authenticate, adminAuth, authIn } from '../middlewares/auth'
import createTeacher from '../controllers/teacher/createTeacher'
import signInTeacher from '../controllers/teacher/signInTeacher'
import validate from '../middlewares/validate'
import pagination from '../middlewares/pagination'
import getTeachers from '../controllers/teacher/get'
import getTeacherById from '../middlewares/getTeacherById'
import patchTeacher from '../controllers/teacher/patchTeacher'


const createRoutes = () => {
    const router = express.Router()

    router.get('/',
        header('Authorization')
            .notEmpty().withMessage('Token tidak boleh kosong'),
        validate(),
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
        header('Authorization')
            .notEmpty().withMessage('Token tidak boleh kosong'),
        validate(),
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

    router.get('/:id',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong'),
        validate(),
        authIn([authenticate(AccountType.GURU, adminAuth)]),
        getTeacherById(true),
    )

    router.post('/lupa-password',)

    router.post('/verifikasi-ganti-password',)

    router.patch('/:id',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong'),
        validate(),
        authIn([authenticate(AccountType.GURU)]),
        getTeacherById(),
        patchTeacher()
    )

    router.patch('/:id/password',)



    return router
}

export default createRoutes