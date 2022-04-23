import { RequestHandler } from 'express'
import SiswaModel from '../../models/dataSiswa'

interface Body {
    email: string,
    password: string
}

const studentSignIn = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { email, password } = req.body
        try {
            const secureStudentAndToken = await SiswaModel.signIn(email, password)

            res.type('application/json')
            res.json(secureStudentAndToken)
        } catch (error) {
            next(error)
        }
    }
}

export default studentSignIn
