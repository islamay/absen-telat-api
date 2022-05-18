import { RequestHandler } from 'express'
import { BodyAfterAuth } from '../../middlewares/auth'
import { compare } from '../../helpers/crypto'
import { BodyAfterGetStudentByNis } from '../../middlewares/getStudentByNisMiddleware'

interface Body extends BodyAfterAuth, BodyAfterGetStudentByNis {
    oldPassword: string,
    newPassword: string
}

const changePassword = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { oldPassword, newPassword, auth, student } = req.body
        try {

            await compare(oldPassword, student.account.password)
            student.account.password = newPassword
            student.wipeTokens()
            student.wipeSuperToken()
            const token = await student.generateToken()
            await student.save()
            res.type('application/json')
            res.json({ guru: student.getDataSiswa(), token })
        } catch (error) {
            next(error)
        }
    }
}

export default changePassword
