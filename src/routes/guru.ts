import express, { Request, Response } from 'express'
import GuruModel, { IGuru } from '../models/guru'

const router = express.Router()

const createRoutes = () => {

    router.get('/', async (req: Request, res: Response) => {
        res.sendStatus(200)
    })

    router.post('/', async (req: Request<{}, {}, IGuru>, res: Response) => {
        const { body } = req
        if (!body.email || !body.namaLengkap || !body.telepon)
            return res.json({ message: 'Data Tidak Lengkap' }).status(400)
        const { email, namaLengkap, telepon, password } = body

        const newGuru = new GuruModel({ email, namaLengkap, telepon, password })
        console.log(newGuru);


        try {
            await newGuru.save()
            return res.status(201).json(newGuru)
        } catch (error) {
            console.log(error.message);
            return res.json({ message: 'Server Error' }).status(500)
        }
    })

    return router
}

export default createRoutes