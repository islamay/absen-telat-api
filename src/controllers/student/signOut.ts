import { RequestHandler } from 'express'
import { BodyAfterAuth } from '../../middlewares/auth'

type Body = BodyAfterAuth

const signOut = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { student, token } = req.body.auth

        try {
            const deleted = student.account.tokens.filter(v => v.token !== token)
            student.account.tokens = deleted

            await student.save()
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
}

export default signOut