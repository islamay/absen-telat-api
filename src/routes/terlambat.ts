import express, { NextFunction, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import { query } from 'express-validator'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'
import { Types } from 'mongoose'
import Api400Error from '../error/Api400Error'
import SiswaModel, { DocumentBaseDataSiswa } from '../models/dataSiswa'
import convertToExcel from '../helpers/keterlambatanExcel'
import { Stream } from 'stream'
import getLateness from '../controllers/keterlambatan/get'
import pagination from '../middlewares/pagination'
import validate from '../middlewares/validate'
import postLateness from '../controllers/keterlambatan/post'
import auth from '../middlewares/auth'
import { AccountType } from '../helpers/accountEnum'

const router = express.Router()

const createTerlambatRoutes = () => {

    router.get('/',
        query('page')
            .optional()
            .isInt().withMessage('Page harus berupa bilangan bulat'),
        query('limit')
            .optional()
            .isInt().withMessage('Limit harus berupa bilangan bulat'),
        validate(),
        pagination(),
        getLateness()
    )

    router.post('/',
        auth(AccountType.GURU),
        postLateness()
    )

    router.get('/download',
        auth(AccountType.GURU),
        query('start')
            .isISO8601()
            .withMessage('start tidak valid'),
        query('end')
            .optional()
            .isISO8601()
            .withMessage('end tidak valid'),

    )

    router.patch('/:id',)

    router.delete('/:id',)


    return router
}

export default createTerlambatRoutes