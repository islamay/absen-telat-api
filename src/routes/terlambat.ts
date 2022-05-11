import express, { NextFunction, Request, Response } from 'express'
import { body, check, header, validationResult } from 'express-validator'
import { query } from 'express-validator'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'
import { Types } from 'mongoose'
import Api400Error from '../error/Api400Error'
import SiswaModel, { DocumentBaseDataSiswa } from '../models/student'
import convertToExcel from '../helpers/keterlambatanExcel'
import { Stream } from 'stream'
import getLateness from '../controllers/lateness/get'
import pagination from '../middlewares/pagination'
import validate from '../middlewares/validate'
import postLateness from '../controllers/lateness/post'
import auth, { adminAuth, authenticate, authIn } from '../middlewares/auth'
import { AccountType } from '../helpers/accountEnum'
import getLatenessById from '../middlewares/getLatenessById'
import patchLateness from '../controllers/lateness/patch'
import deleteLateness from '../controllers/lateness/delete'
import Api401Error from '../error/Api401Error'
import getLatenessByNis from '../middlewares/getLatenessByNis'
import { Purposes } from '../models/lateness'
import downloadLatenesses from '../controllers/lateness/download'

const router = express.Router()

const createTerlambatRoutes = () => {

    router.get('/',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        auth(AccountType.GURU),
        query('page')
            .optional()
            .isInt().withMessage('Page harus berupa bilangan bulat')
            .toInt(),
        query('limit')
            .optional()
            .isInt().withMessage('Limit harus berupa bilangan bulat')
            .toInt(),
        query('start')
            .optional()
            .isISO8601().withMessage('Date tidak valid').toDate(),
        query('end')
            .optional()
            .isISO8601().withMessage('Date tidak valid').toDate(),
        validate(),
        pagination(),
        getLateness()
    )

    router.post('/',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        auth(AccountType.GURU),
        body('nis')
            .notEmpty().withMessage('Nis tidak boleh kosong')
            .isString().withMessage('Nis harus berupa text'),
        body('purpose')
            .notEmpty().withMessage('Alasan tidak boleh kosong')
            .isString().withMessage('Nis harus berupa text')
            .isIn(Object.values(Purposes)).withMessage('Alasan tidak valid'),
        validate(),
        postLateness()
    )

    // router.get('/download',
    //     header('authorization')
    //         .notEmpty().withMessage('Token tidak boleh kosong')
    //         .isString().withMessage('Token harus berupa text'),
    //     validate(),
    //     auth(AccountType.GURU),
    //     query('start')
    //         .isISO8601()
    //         .withMessage('start tidak valid'),
    //     query('end')
    //         .optional()
    //         .isISO8601()
    //         .withMessage('end tidak valid'),
    //     validate(),

    // )

    router.get('/download',
        query('start')
            .notEmpty()
            .isISO8601().withMessage('Date tidak valid')
            .toDate(),
        query('end')
            .notEmpty()
            .isISO8601().withMessage('Date tidak valid')
            .toDate(),
        validate(),
        downloadLatenesses()
    )

    router.get('/nis/:nis',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate<{ nis: string }>(AccountType.SISWA, req => {
            if (req.params.nis !== req.body.auth.student.nis) throw new Api401Error('Token invalid')
        }), authenticate(AccountType.GURU)]),
        query('tahun')
            .optional()
            .isInt().withMessage('Tahun harus berupa bilangan bulat'),
        query('bulan')
            .optional()
            .isInt().withMessage('Tahun harus berupa bilangan bulat'),
        pagination(),
        getLatenessByNis(true)
    )

    router.get('/:id',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate(AccountType.SISWA), authenticate(AccountType.GURU, adminAuth)]),
        getLatenessById(true),
    )

    router.patch('/:id',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate(AccountType.SISWA), authenticate(AccountType.GURU, adminAuth)]),
        body('alasan')
            .notEmpty().withMessage('Alasan tidak boleh kosong')
            .isString().withMessage('Alasan harus berupa text'),
        validate(),
        getLatenessById(),
        patchLateness()
    )

    router.delete('/:id',
        header('authorization')
            .notEmpty().withMessage('Token tidak boleh kosong')
            .isString().withMessage('Token harus berupa text'),
        validate(),
        authIn([authenticate(AccountType.GURU, adminAuth)]),
        getLatenessById(),
        deleteLateness()
    )




    return router
}

export default createTerlambatRoutes