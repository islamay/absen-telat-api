import { RequestHandler } from 'express'
import { TeacherJwtPayload } from '../helpers/jwtManager'
import { TeacherRole } from '../helpers/accountEnum'
import Api401Error from '../error/Api401Error'

interface Body {
    auth: {
        decoded: TeacherJwtPayload
    }
}

const adminAuth = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { decoded } = req.body.auth
        try {
            if (decoded.role !== TeacherRole.ADMIN) throw new Api401Error('Akun ini bukan admin')
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default adminAuth