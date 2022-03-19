import express, { Request, Response } from 'express'
import KeterlambatanModel, { ITelat, KnownError } from '../models/keterlambatan'
import isKnownError from '../helpers/isKnownError'
import { middlewareBodyType as guruMiddlewareBodyI, middlewareVarKey as guruMiddlewareVarKey } from '../middlewares/guruAuth'
import guruAuthMiddleware from '../middlewares/guruAuth'

const router = express.Router()

const createTerlambatRoutes = () => {

    {
        type BelowBodyType = { middleware: guruMiddlewareBodyI } & Omit<ITelat, 'date' | 'guruId'>;
        router.post('/', guruAuthMiddleware, async (req: Request<{}, {}, BelowBodyType>, res: Response) => {
            const { body } = req


            if (!body.nis) return res.status(400).json({ message: 'Data Tidak Lengkap' })

            const idGuru = body.middleware[guruMiddlewareVarKey].decodedToken._id
            const { nis } = body

            const terlambat = new KeterlambatanModel({ idGuru, nis })

            try {
                await terlambat.save()
                return res.json(terlambat).status(201)
            } catch (error) {

                if (isKnownError(error.message, KnownError)) return res.status(400).json({ message: error.message })
                else {
                    console.log(error);
                    return res.status(500).json({ message: 'Server Error' })
                }
            }
        })
    }


    return router
}

export default createTerlambatRoutes