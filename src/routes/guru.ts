import express from 'express'
import { header, body } from 'express-validator'
import { AccountType } from '../helpers/accountEnum'
import auth from '../middlewares/auth'
import adminAuth from '../middlewares/adminAuth'
import createTeacher from '../controllers/teacher/createTeacher'
import signInTeacher from '../controllers/teacher/signInTeacher'
import validate from '../middlewares/validate'


const createRoutes = () => {
    const router = express.Router()

    router.get('/',)

    router.post('/',
        header('Authorization')
            .notEmpty().withMessage('Token tidak boleh kosong'),
        validate(),
        auth(AccountType.GURU),
        adminAuth(),
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

    router.get('/:id',)

    router.post('/lupa-password',)

    router.post('/verifikasi-ganti-password',)

    router.patch('/:id/password',)

    router.patch('/:id',)


    return router
}

export default createRoutes