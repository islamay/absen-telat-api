import express, { NextFunction, Request, Response } from 'express'
import KeterlambatanModel, { ITelat, KnownError } from '../models/keterlambatan'
import isKnownError from '../helpers/isKnownError'
import guruAuthMiddleware, { middlewareBodyType as GuruMiddlewareBody } from '../middlewares/guruAuth'
import siswaAuthMiddleware, { middlewareBodyType as SiswaMiddlewareBody } from '../middlewares/siswaAuth'
import { check, validationResult } from 'express-validator'
import { query } from 'express-validator/check'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'
import { Types } from 'mongoose'
import Api400Error from '../error/Api400Error'
import SiswaModel from '../models/dataSiswa'

const router = express.Router()

const createTerlambatRoutes = () => {

    {

        interface QueryParam {
            date: Date
        }
        router.get('/',
            guruAuthMiddleware,
            query('date')
                .isDate()
                .withMessage('Tanggal Tidak Valid'),
            async (req: Request<{}, {}, {}, QueryParam>, res: Response, next: NextFunction) => {
                try {
                    const date = req.query.date
                    let keterlambatanDocuments;

                    if (date) {
                        keterlambatanDocuments = await KeterlambatanModel.find({})
                    } else {
                        keterlambatanDocuments = await KeterlambatanModel.find({})
                    }

                    return res.json(keterlambatanDocuments)
                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        router.get('/siswa/:idSiswa')
    }

    {
        enum BodyFields {
            nis = 'nis',
            alasan = 'nis'
        }
        interface BodyType extends Omit<ITelat, 'date' | 'idGuru'> {
            middleware: GuruMiddlewareBody
        }
        router.post('/',
            guruAuthMiddleware,
            check(BodyFields.nis)
                .notEmpty()
                .withMessage('nis Harus Diisi')
                .isString()
                .withMessage('nis Harus Berupa Text')
                .custom(async (nis) => {
                    const siswaDocument = await SiswaModel.findOne({ nis })
                    if (!siswaDocument) return Promise.reject('nis Tidak Valid')
                    return true
                })
            ,
            check(BodyFields.alasan)
                .isString()
                .withMessage('Alasan Harus Berupa Text'),
            async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))

                    const { nis, alasan } = req.body
                    const { guruDocument } = req.body.middleware.guruAuth
                    const idGuru = guruDocument._id
                    const keterlambatanDocument = await KeterlambatanModel.createOne({ idGuru, nis, alasan })

                    res.status(201).json(keterlambatanDocument)
                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        enum BodyFields {
            alasan = 'alasan'
        }
        interface BodyType {
            alasan: string,
            middleware: SiswaMiddlewareBody
        }
        router.put('/:keterlambatanId/alasan',
            siswaAuthMiddleware,
            check(BodyFields.alasan)
                .notEmpty()
                .withMessage('Alasan Harus Diisi')
                .isString()
                .withMessage('Alasan Harus Berupa Text'),
            async (req: Request<{ keterlambatanId: Types.ObjectId }, {}, BodyType>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))

                    const { keterlambatanId } = req.params
                    const { alasan } = req.body
                    console.log(req.body.middleware);

                    const { userSiswaDocument } = req.body.middleware.siswaAuth
                    if (!Types.ObjectId.isValid(keterlambatanId)) throw new Api400Error('ValidationError', 'Id Tidak Valid')
                    await KeterlambatanModel.findByIdAndUpdateAlasan(keterlambatanId, userSiswaDocument.nis, alasan)

                    res.sendStatus(200)
                } catch (error) {
                    console.log(error);

                    next(error)
                }
            }
        )
    }


    return router
}

export default createTerlambatRoutes