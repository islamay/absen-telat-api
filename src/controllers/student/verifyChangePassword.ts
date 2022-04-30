import { RequestHandler } from 'express'
import Api401Error from '../../error/Api401Error'
import { verifyStudentSuperJwt } from '../../helpers/jwtManager'
import SiswaModel from '../../models/student'

interface Body {
    email: string
    pass: string
}

const verifyChangePassword = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { pass, email } = req.body
        try {
            const student = await SiswaModel.findByEmail(email)
            if (!student.account || !student.account.superToken) throw new Api401Error('Pengguna tidak ingin mengganti password')
            const { pass: realPass } = await verifyStudentSuperJwt(student.account.superToken)
            if (pass !== realPass) throw new Api401Error('Kode verifikasi salah')

            res.type('application/json')
            res.json({ superToken: student.account.superToken, nis: student.nis })
        } catch (error) {
            next(error)
        }
    }
}

export default verifyChangePassword