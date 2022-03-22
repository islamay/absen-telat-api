import express, { Request, Response } from 'express'
import createAdminAuthMiddleware from '../middlewares/adminAuth'
import DataSiswaModel, { DataSiswa } from '../models/dataSiswa'
import validateDataSiswa from '../validation/dataSiswa'
import _ from 'lodash'

const router = express.Router()

const createRoutes = () => {

    router.get('/', () => {

    })

    {
        type ReqBody = Omit<DataSiswa, 'kelasString'>;
        router.post('/',
            createAdminAuthMiddleware(),
            async (req: Request<{}, {}, ReqBody>, res: Response, next) => {

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