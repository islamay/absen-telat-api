import { Request, Response, NextFunction } from 'express'
import SiswaModel from '../../models/dataSiswa'
import UserSiswaModel from '../../models/userSiswa'
import { accountStatus } from '../../helpers/accountEnum'

interface IQuery {
    status?: accountStatus,
    nama: string
}

const getByName = async (req: Request<{}, {}, {}, IQuery>, res: Response, next: NextFunction) => {
    const { nama = null } = req.query

    try {
        const siswaDocuments = await SiswaModel.findSiswaByName(nama)
        const nisses = siswaDocuments.map((siswa) => siswa.nis)
        const userSiswaDocuments = await UserSiswaModel.find({ nis: { $in: nisses } }, ['-password', '-tokens']).populate('siswa').lean()
        res.json(userSiswaDocuments)
    } catch (error) {
        next(error)
    }
}

export default getByName