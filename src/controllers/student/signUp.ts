import { RequestHandler, Response } from 'express'
import SiswaModel from '../../models/student'

interface Body {
    nis: string,
    email: string,
    password: string
}

interface ResponseType {
    nis: string,
    email: string
}

const studentSignUp = (): RequestHandler<{}, {}, Body> => {

    return async (req, res: Response<ResponseType>, next) => {
        const { nis, email, password } = req.body
        try {
            await SiswaModel.signUp(nis, email, password)

            res.status(201)
            res.type('application/json')
            res.json({ nis, email })
        } catch (error) {
            next(error)
        }
    }
}

export default studentSignUp