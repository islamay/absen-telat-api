import { RequestHandler } from 'express'
import Api401Error from '../../error/Api401Error'
import { AccountStatus, AccountType } from '../../helpers/accountEnum'
import { BodyAfterAuth } from '../../middlewares/auth'
import { BodyAfterGetStudentByNis } from '../../middlewares/getStudentByNisMiddleware'

interface Body extends BodyAfterAuth, BodyAfterGetStudentByNis {
    nama?: string,
    status?: AccountStatus,
    email?: string
}

const patchStudent = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { nama = null, email = null, status = null, student = null, auth } = req.body
        try {
            if (auth.type === AccountType.SISWA && nama || status) throw new Api401Error('Tidak berhak mengganti dokumen')

            nama ? student.namaLengkap = nama : null
            email ? student.account.email = email : null
            status ? student.account.status = status : null

            await student.save()

            res.type('application/json')
            res.json(student.getDataSiswa())
        } catch (error) {
            next(error)
        }
    }
}

export default patchStudent



