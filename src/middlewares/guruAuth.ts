import { Request, Response, NextFunction } from 'express'
import { verifyGuruJwt, KnownJwtError, guruJwtPayload } from '../helpers/jwtManager'
import middlewareVar from '../helpers/middlewareVar'
import isKnownError from '../helpers/isKnownError'
import GuruModel, { DocumentBaseIGuru } from '../models/guru'
import { accountStatus } from '../helpers/accountEnum'
import splitBearerToken from '../helpers/splitBearerToken'
import Api500Error from '../error/Api500Error'
import Api401Error from '../error/Api401Error'
import { JwtPayload } from 'jsonwebtoken'

export enum KnownError {
    tokenEmpty = 'Tidak memiliki Akses'
}

export const middlewareVarKey = 'guruAuth'

export interface middlewareBodyType {
    guruAuth: {
        token: string,
        decodedToken: JwtPayload & guruJwtPayload,
        guruDocument: DocumentBaseIGuru,
    }
}



const guruAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = splitBearerToken(req.headers.authorization)
        const decodedToken = await verifyGuruJwt(token)
        if (typeof decodedToken === 'string') {
            throw new Api500Error()
        }

        if (decodedToken.status === accountStatus.MENUNGGU) {
            throw new Api401Error('Akun Tidak Aktif')
        }

        const guruDocument = await GuruModel.findOneByToken(token)

        middlewareVar(req, { decodedToken, guruDocument, token }, middlewareVarKey)

        next()
    } catch (error) {
        next(error)
    }

}


export default guruAuthMiddleware



