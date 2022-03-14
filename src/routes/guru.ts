import express, { Request, Response } from 'express'
import GuruModel, { IGuru, KnownError as GuruError } from '../models/guru'
import { createGuruJWT } from '../helpers/jwtManager'
import { compare } from '../helpers/crypto'
import isKnownError from '../helpers/isKnownError'

const router = express.Router()

const createRoutes = () => {

    router.get('/', async (req: Request, res: Response) => {
        res.sendStatus(200)
    })

    router.post('/', async (req: Request<{}, {}, IGuru>, res: Response) => {
        const { body } = req
        if (!body.email || !body.namaLengkap)
            return res.json({ message: 'Data Tidak Lengkap' }).status(400)
        const { email, namaLengkap, password } = body

        const newGuru = new GuruModel({ email, namaLengkap, password })
        await newGuru.save()
        const publicData = newGuru.secureData()
        const jwt = await createGuruJWT(JSON.stringify(publicData))

        try {

            return res.status(201).json({ ...publicData, token: jwt })
        } catch (error) {
            console.log(error.message);
            return res.json({ message: 'Server Error' }).status(500)
        }
    })

    {
        type ThisBodyType = { email: string, password: string };
        router.post('/login', async (req: Request<{}, {}, ThisBodyType>, res: Response) => {
            const { body } = req
            if (!body.email || !body.password) return res.status(400).json({ message: 'Data Tidak Lengkap' })

            const { email, password } = body
            try {
                const guru = await GuruModel.findByEmail(email)
                const { password: realPassword } = guru

                const isCorrect = await compare(password, realPassword)
                if (!isCorrect) return res.status(401).json({ message: 'Password Salah' })

                try {
                    const publicData = guru.secureData()
                    const token = await createGuruJWT(JSON.stringify(guru))
                    return res.json({ ...publicData, token: token })
                } catch (error) {
                    return res.status(500).json({ message: 'Server Error' })
                }

            } catch (error) {
                if (isKnownError(error.message, GuruError)) { return res.status(404).json({ message: error.message }) }
                else return res.status(500).json({ message: 'Server Error' })
            }

        })
    }

    return router
}

export default createRoutes