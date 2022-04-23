import { RequestHandler } from 'express'
import SiswaModel from '../../models/dataSiswa'
import { createStudentSuperJwt, decodeStudentSuperJwt } from '../../helpers/jwtManager'
import { sendMail } from '../../helpers/mailer'
import { createPasswordResetEmail } from '../../helpers/emailContent'

interface Body {
    email: string
}

const requestChangePassword = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { email } = req.body

        try {
            const student = await SiswaModel.findByEmail(email)
            const superToken = await createStudentSuperJwt(student)
            const { pass } = await decodeStudentSuperJwt(superToken)
            student.account.superToken = superToken

            const savingStudent = student.save()
            const sendingEmail = sendMail(email, 'Permintaan mengganti password', createPasswordResetEmail(email, pass))

            await Promise.all([savingStudent, sendingEmail])

            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
}

export default requestChangePassword