import express from 'express'
import SiswaModel, { Siswa } from '../models/siswa'

const router = express.Router()

// Create Siswa
export default () => {

    router.post('/', async (req: express.Request<{}, {}, Omit<Siswa, 'qrcode'>>, res: express.Response) => {
        const { body } = req
        if (!body.nis || !body.namaLengkap || !body.kelas || !body.jurusan || !body.email || !body.password)
            return res.json({ message: 'Data tidak lengkap' }).status(400)
        const { nis, namaLengkap, kelas, jurusan, email, password } = req.body

        const siswa = await SiswaModel.findOne({ nis: nis })
        if (siswa) return res.send({ message: 'Nis Sudah dipakai' }).status(400)


        try {
            const newSiswa = new SiswaModel({ nis, namaLengkap, kelas, jurusan, email, password })
            await newSiswa.save()
            const publicData = newSiswa.secureData()

            return res.json(publicData).status(201)
        } catch (error) {
            console.log(error);
            return res.send({ message: 'Telah terjadi Error' }).status(500)
        }
    })

    return router
}


