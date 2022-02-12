import express, { Request, Response } from 'express'
import TerlambatModel, { ITelat, KnownError } from '../models/telat'
import isKnownError from '../helpers/isKnownError'


const router = express.Router()


const createTerlambatRoutes = () => {

    router.get('/', (req: Request, res: Response) => {
        return res.sendStatus(200)
    })

    router.post('/', async (req: Request<{}, {}, Omit<ITelat, 'date'>>, res: Response) => {
        const { body } = req
        if (!body.idGuru || !body.nis) return res.json({ message: 'Data Tidak Lengkap' }).status(400)

        const { idGuru, nis } = body

        const terlambat = new TerlambatModel({ idGuru, nis })

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


    return router
}

export default createTerlambatRoutes