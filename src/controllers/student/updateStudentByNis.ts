import { RequestHandler } from 'express'
import { AccountStatus } from '../../helpers/accountEnum'
import { BodyAfterGetStudentByNis } from '../../middlewares/getStudentByNisMiddleware'

interface Body extends BodyAfterGetStudentByNis {
    nama?: string,
    account?: {
        email?: string,
        status?: AccountStatus,
    }
}

const updateStudentByNis = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { student, nama = null, } = req.body
        const { email = null, status = null } = req.body.account

        nama ? student.namaLengkap = nama : null
        email ? student.account.email = email : null
        status ? student.account.status = status : null

        try {
            await student.save()
            res.type('application/json')
            res.json(student.getDataSiswa())
        } catch (error) {
            next(error)
        }
    }
}

export default updateStudentByNis