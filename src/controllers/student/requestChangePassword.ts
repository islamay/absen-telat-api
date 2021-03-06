import { RequestHandler } from 'express'
import { sendPasswordResetRequestEmail } from '../../helpers/mailer'
import Api404Error from '../../error/Api404Error'
import { findByEmail } from '../../services/student'
import { createStudentSuperJwt } from '../../helpers/jwtManager'

interface Body {
    email: string
}

const requestChangePassword = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { email } = req.body

        try {
            const student = await findByEmail(email)
            if (!student) throw new Api404Error(`Tidak ditemukan pengguna dengan email ${email}`)
            student.account.superToken = (await createStudentSuperJwt(student)).token
            await student.save()
            const magicLink = 'https://' + req.get('host') + '/siswa/reset-password?token=' + student.account.superToken
            sendPasswordResetRequestEmail(email, magicLink)
            res.type('application/json')
            res.json({
                message: 'Success'
            })
        } catch (error) {
            next(error)
        }
    }
}

export default requestChangePassword