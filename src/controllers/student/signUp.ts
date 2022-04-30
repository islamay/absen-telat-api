import { RequestHandler, Response } from 'express'
import SiswaModel from '../../models/student'

interface Body {
    nis: string,
    email: string,
    password: string
}

interface ResponseType {
    token: string
}

const studentSignUp = (): RequestHandler<{}, {}, Body> => {

    return async (req, res: Response<ResponseType>, next) => {
        const { nis, email, password } = req.body
        try {
            await SiswaModel.signUp(nis, email, password)


            res.sendStatus(201)
        } catch (error) {
            next(error)
        }
    }
}

export default studentSignUp