import express, { Request, Response, NextFunction } from 'express'
import GuruModel, { IGuru, IGuruAsParam, KnownError as GuruError } from '../models/guru'
import { createGuruJWT } from '../helpers/jwtManager'
import { compare } from '../helpers/crypto'
import isKnownError from '../helpers/isKnownError'
import _ from 'lodash'

const router = express.Router()

const createRoutes = () => {

    router.get('/', async (req: Request, res: Response) => {
        res.sendStatus(200)
    })

    {
        type ReqBody = IGuruAsParam;
        router.post('/registrasi', async (req: Request<{}, {}, ReqBody>, res: Response, next: NextFunction) => {
            const { body } = req
            try {
                const [guruDocument, jwt] = await GuruModel.createGuruAndJwt(body)
                const guruPublicData = guruDocument.secureData()
                res.status(201).json(_.assign(guruPublicData, { token: jwt }))
            } catch (error) {
                next(error)
            }
        })
    }

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