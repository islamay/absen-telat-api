import express, { Request, Response } from 'express'
import _ from 'lodash'
import BaseError from '../errorHandler/baseError'
import DataSiswaModel, { DataSiswa } from '../models/dataSiswa'
import isArrayHasNullValue from '../helpers/anyNull'
import Api400Error from '../errorHandler/Api400Error'
import badRequestErrorName from '../errorHandler/badRequestErrorName'
import validateDataSiswa from '../validation/dataSiswa'

const router = express.Router()

const createRoutes = () => {

    router.get('/', () => {

    })

    {
        type ReqBody = Omit<DataSiswa, 'kelasString'>;
        router.post('/', async (req: Request<{}, {}, ReqBody>, res: Response, next) => {

            const { nis, namaLengkap, kelas, kelasNo, jurusan } = req.body || null

            try {
                validateDataSiswa({ nis, namaLengkap, kelas, kelasNo, jurusan })
                const dataSiswaDocument = await DataSiswaModel.createSiswa({ nis: nis, namaLengkap, kelas, kelasNo, jurusan })
                const dataSiswaObject = dataSiswaDocument.getDataSiswa()

                return res.status(201).json(dataSiswaObject)
            } catch (error) {
                console.log(error);

                return next(error)
            }

        })
    }

    return router
}

export default createRoutes