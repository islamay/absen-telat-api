import { RequestHandler, Response } from 'express'
import SiswaModel from '../../models/dataSiswa'

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
            const token = await SiswaModel.signUp(nis, email, password)

            res.type('application/json')
            res.json(token)
        } catch (error) {
            next(error)
        }
    }
}

export default studentSignUp