import express, { NextFunction, Request, Response } from 'express'
import createAdminAuthMiddleware from '../middlewares/adminAuth'
import DataSiswaModel, { DataSiswa } from '../models/dataSiswa'
import { query, validationResult } from 'express-validator'
import validateDataSiswa from '../validation/dataSiswa'
import _ from 'lodash'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'
import siswaAuthMiddleware, { middlewareBodyType as siswaAuthMiddlewareBodyType } from '../middlewares/siswaAuth'
import Api401Error from '../error/Api401Error'
import TerlambatModel from '../models/keterlambatan'


const router = express.Router()

const createRoutes = () => {
    {
        interface QueryParams {
            name: string | undefined
        }
        router.get('/',
            query('name')
                .optional(true)
                .isString()
                .withMessage('Nama Siswa Harus Berupa Text'),
            async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))
                    const { name = '' } = req.query
                    const siswaDocuments = await DataSiswaModel.findSiswaByName(name)
                    res.json(siswaDocuments)

                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        interface Body {
            middleware: siswaAuthMiddlewareBodyType
        }
        router.get('/:nis/keterlambatan',
            siswaAuthMiddleware,
            async (req: Request<{ nis: string }, {}, Body>, res: Response, next) => {
                try {
                    if (req.body.middleware.siswaAuth.userSiswaDocument.nis !== req.params.nis) {
                        throw new Api401Error('Unauthorized')
                    }

                    const terlambatDocuments = await TerlambatModel.find({ nis: req.params.nis }).populate('siswa').lean()
                    res.json(terlambatDocuments)

                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        type ReqBody = Omit<DataSiswa, 'kelasString' | 'fullClass'>;
        router.post('/',
            createAdminAuthMiddleware(),
            async (req: Request<{}, {}, ReqBody>, res: Response, next: NextFunction) => {

                const { nis, namaLengkap, kelas, kelasNo, jurusan } = req.body || null

                try {
                    await validateDataSiswa({ nis, namaLengkap, kelas, kelasNo, jurusan })
                    const dataSiswaDocument = await DataSiswaModel.createSiswa({ nis: nis, namaLengkap, kelas, kelasNo, jurusan })
                    const dataSiswaObject = dataSiswaDocument.getDataSiswa()

                    return res.status(201).json(dataSiswaObject)
                } catch (error) {

                    next(error)
                }

            })
    }

    return router
}

export default createRoutes