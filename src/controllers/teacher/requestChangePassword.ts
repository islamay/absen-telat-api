import { RequestHandler } from 'express'
import { sendPasswordResetRequestEmail } from '../../helpers/mailer'
import Api404Error from '../../error/Api404Error'
import { findByEmail } from '../../services/teacher'
import { createTeacherSuperJwt } from '../../helpers/jwtManager'

interface Body {
    email: string
}

const requestChangePassword = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { email } = req.body

        try {
            const teacher = await findByEmail(email)
            if (!teacher) throw new Api404Error(`Tidak ditemukan pengguna dengan email ${email}`)
            teacher.superToken = (await createTeacherSuperJwt(teacher)).token
            await teacher.save()
            const magicLink = 'https://' + req.get('host') + '/guru/reset-password?token=' + teacher.superToken
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