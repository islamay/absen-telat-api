import { RequestHandler } from 'express'
import { BodyAfterGetTeacherById } from '../../middlewares/getTeacherById'
import { BodyAfterAuth } from '../../middlewares/auth'
import Api403Error from '../../error/Api403Error'
import { compare } from '../../helpers/crypto'

interface Body extends BodyAfterAuth, BodyAfterGetTeacherById {
    oldPassword: string,
    newPassword: string
}

const changePassword = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { oldPassword, newPassword, auth, teacher } = req.body
        try {
            if (auth.teacher.id !== teacher.id) throw new Api403Error('Tidak berhak mengubah dokumen')

            await compare(oldPassword, teacher.password)
            teacher.password = newPassword
            teacher.wipeTokens()
            teacher.wipeSuperToken()
            const token = await teacher.generateToken()
            await teacher.save()
            res.type('application/json')
            res.json({ guru: teacher.secureData(), token })
        } catch (error) {
            next(error)
        }
    }
}

export default changePassword
