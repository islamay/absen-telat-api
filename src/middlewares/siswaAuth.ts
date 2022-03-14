import { Request, Response, NextFunction } from 'express'
import { verifyMuridJwt, KnownJwtError } from '../helpers/jwtManager'
import middlewareVar from '../helpers/middlewareVar'
import isKnownError from '../helpers/isKnownError'
import { DocumentBaseISiswa } from '../models/userSiswa'
import { accountStatus } from '../helpers/accountEnum'
export const middlewareVarKey = 'siswaAuth'
export enum KnownError {
    tokenEmpty = 'Tidak memiliki Akses'
}
export interface middlewareBodyType extends DocumentBaseISiswa { }


const siswaAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) return res.status(401).json({ message: KnownError.tokenEmpty })

    const token = bearerToken.split(' ')[1]
    try {
        const decodedToken = await verifyMuridJwt(token)
        if (typeof decodedToken === 'string') return res.sendStatus(500)

        if (decodedToken.status === accountStatus.MENUNGGU) {
            return res.sendStatus(401)
        }

        middlewareVar(req, decodedToken, middlewareVarKey)

        next()
    } catch (error) {
        if (isKnownError(error.message, KnownJwtError)) { return res.status(400).json({ message: error.message }) }
        else return res.status(500).json({ message: 'Server Error' })
    }
}

export default siswaAuthMiddleware








