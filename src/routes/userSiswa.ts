import express, { Request, Response } from 'express'
import UserSiswaModel, { UserSiswa } from '../models/userSiswa'
import siswaAuthMiddleware, { middlewareBodyType, middlewareVarKey } from '../middlewares/siswaAuth'
import TerlambatModel from '../models/keterlambatan'
import { compare } from '../helpers/crypto'
import { createMuridJWT } from '../helpers/jwtManager'

const router = express.Router()

// Create UserSiswa
export default () => {


    router.post('/', async (req: Request<{}, {}, Omit<UserSiswa, 'qrcode'>>, res: Response) => {
        const { body } = req
        if (!body.nis || !body.namaLengkap || !body.kelas || !body.jurusan || !body.email || !body.password)
            return res.json({ message: 'Data tidak lengkap' }).status(400)
        const { nis, namaLengkap, kelas, jurusan, email, password } = req.body

        const siswa = await UserSiswaModel.findOne({ nis: nis })
        if (siswa) return res.send({ message: 'Nis Sudah dipakai' }).status(400)


        try {
            const newSiswa = new UserSiswaModel({ nis, namaLengkap, kelas, jurusan, email, password })
            await newSiswa.save()
            const publicData = newSiswa.secureData()
            const jwt = await createMuridJWT(JSON.stringify(publicData))


            return res.json({ ...publicData, token: jwt }).status(201)
        } catch (error) {
            console.log(error);
            return res.send({ message: 'Telah terjadi Error' }).status(500)
        }
    })

    {
        interface BelowBodyType {
            email: string;
            password: string;
        }
        router.post('/login', async (req: Request<{}, {}, BelowBodyType>, res: Response) => {
            if (!req.body.email || !req.body.password) return res.status(400).json({ message: 'Data Tidak Lengkap' })
            const { email, password: plainPassword } = req.body
            try {
                const siswa = await UserSiswaModel.findOneByEmail(email)
                if (!siswa) return res.status(400).json({ message: 'Email Tidak Ditemukan' })
                const isVerified = await compare(plainPassword, siswa.password)
                if (!isVerified) return res.status(401).json({ message: 'Password Salah' })

                // Verified, create Jwt
                const publicData = siswa.secureData()


                const jwt = await createMuridJWT(JSON.stringify(publicData))
                return res.json({ token: jwt })

            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: 'Server Error' })
            }
        })
    }

    {
        interface BelowBodyType {
            middleware: {
                [middlewareVarKey]: middlewareBodyType
            }
        }
        router.get('/saya', siswaAuthMiddleware, async (req: Request<{}, {}, BelowBodyType>, res: Response) => {
            const { _id } = req.body.middleware[middlewareVarKey]
            try {
                const siswa = await UserSiswaModel.findById(_id)
                const keterlambatan = await TerlambatModel.findByNis(siswa.nis)
                const siswaInformation = Object.assign(siswa.secureData(), { keterlambatan: keterlambatan })
                return res.json(siswaInformation)
            } catch (error) {
                console.log(error);
                return res.sendStatus(500)
            }
        })
    }


    return router
}


