import { Request, Response, NextFunction } from 'express'
import { siswaJwtPayload, verifyMuridJwt, } from '../helpers/jwtManager'
import middlewareVar from '../helpers/middlewareVar'
import isKnownError from '../helpers/isKnownError'
import UserSiswaModel, { DocumentBaseUserSiswa } from '../models/userSiswa'
import { accountStatus } from '../helpers/accountEnum'
import splitBearerToken from '../helpers/splitBearerToken'
import { Types } from 'mongoose'
import Api401Error from '../error/Api401Error'
import { JwtPayload } from 'jsonwebtoken'
export const middlewareVarKey = 'siswaAuth'
export enum KnownError {
    tokenEmpty = 'Tidak memiliki Akses'
}
export interface middlewareBodyType {
    siswaAuth: {
        decodedToken: JwtPayload & siswaJwtPayload,
        userSiswaDocument: DocumentBaseUserSiswa
    }
}


const siswaAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = splitBearerToken(req.headers.authorization)
        const decodedToken = await verifyMuridJwt(token)
        const { _id: id } = decodedToken

        if (decodedToken.status === accountStatus.MENUNGGU) throw new Api401Error('Token Tidak Valid')
        if (!Types.ObjectId.isValid(id)) throw new Api401Error('Token Tidak Valid')

        const userSiswaDocument = await UserSiswaModel.findOneByToken(token)


        middlewareVar(req, { decodedToken, userSiswaDocument }, middlewareVarKey)

        next()
    } catch (error) {
        next(error)
    }
}

export default siswaAuthMiddleware








