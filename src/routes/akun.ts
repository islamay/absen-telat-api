import express, { Request, Response } from 'express';
import { accountRole, accountStatus } from '../helpers/accountEnum';
import { Types } from 'mongoose';
import GuruModel from '../models/guru';
import SiswaModel from '../models/userSiswa';

const router = express.Router()



interface aktifasiBody {
    role: accountRole,
    id: Types.ObjectId
}

const createAkunRouter = () => {

    router.post('/aktifasi', async (req: Request<{}, {}, aktifasiBody>, res: Response) => {
        if (!req.body.id || !req.body.role) {
            return res.status(400).json({ error: 'Data Tidak Lengkap' })
        }

        const { id, role } = req.body
        const isValidId = Types.ObjectId.isValid(id)

        if (!isValidId) {
            return res.status(404).json({ error: 'Not Found' })
        }

        if (role === accountRole.GURU) {
            try {
                const guru = await GuruModel.findById(id)
                guru.status = accountStatus.AKTIF
                await guru.save()
                return res.sendStatus(200)
            } catch (error) {
                return res.status(400).json({ error: 'Server Error' })
            }
        }

        if (role === accountRole.SISWA) {
            try {
                const siswa = await SiswaModel.findById(id)
                siswa.status = accountStatus.AKTIF
                await siswa.save()
                return res.sendStatus(200)
            } catch (error) {
                console.log(error);
                console.log(error.message);
                return res.status(400).json({ error: 'Server Error' })
            }
        }



    })
}

export default createAkunRouter



