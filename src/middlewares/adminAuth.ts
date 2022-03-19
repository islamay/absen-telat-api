import { Request, Response, NextFunction } from 'express'
import Api401Error from '../error/Api401Error'
import { guruJwtPayload, verifyGuruJwt } from '../helpers/jwtManager'
import splitBearerToken from '../helpers/splitBearerToken'
import GuruModel, { DocumentBaseIGuru, guruRole } from '../models/guru'
import middlewareVar from '../helpers/middlewareVar'
import _ from 'lodash'
import { JwtPayload } from 'jsonwebtoken'

export interface adminAuthMiddleware {
    adminAuth: {
        decodedToken: JwtPayload & guruJwtPayload,
        guruDocument: DocumentBaseIGuru,
        token: string
    }
}

const createAdminAuthMiddleware = () => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = splitBearerToken(req.headers.authorization)
            const decodedToken = await verifyGuruJwt(token)
            if (decodedToken.role !== guruRole.ADMIN) {
                throw new Api401Error('Bukan Admin')
            }

            const guruDocument = await GuruModel.findOneByToken(token)
            if (!guruDocument) {
                throw new Api401Error('Token Tidak Valid')
            }

            middlewareVar(req, { decodedToken, guruDocument, token }, 'adminAuth')
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default createAdminAuthMiddleware
