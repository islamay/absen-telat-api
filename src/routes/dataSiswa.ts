import express, { NextFunction, Request, Response } from 'express'
import createAdminAuthMiddleware from '../middlewares/adminAuth'
import DataSiswaModel, { DataSiswa } from '../models/dataSiswa'
import { query, validationResult } from 'express-validator'
import validateDataSiswa from '../validation/dataSiswa'
import _ from 'lodash'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'

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
        type ReqBody = Omit<DataSiswa, 'kelasString'>;
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