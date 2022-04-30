import { RequestHandler } from 'express'
import { StudentJwtPayload, TeacherJwtPayload } from '../helpers/jwtManager'
import { AccountType, TeacherRole } from '../helpers/accountEnum'
import Api401Error from '../error/Api401Error'

interface Body {
    auth: {
        decoded: TeacherJwtPayload | StudentJwtPayload
    }
}

const adminAuth = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { decoded } = req.body.auth
        try {
            //@ts-ignore
            if (decoded.role !== TeacherRole.ADMIN) throw new Api401Error('Akun ini bukan admin')
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default adminAuth