import { RequestHandler } from 'express'
import { signIn } from '../../services/student'

interface Body {
    email: string,
    password: string
}

const studentSignIn = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { email, password } = req.body
        try {
            const secureStudentAndToken = await signIn(email, password)

            res.type('application/json')
            res.json(secureStudentAndToken)
        } catch (error) {
            next(error)
        }
    }
}

export default studentSignIn
