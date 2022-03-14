import { Request, Response, NextFunction } from 'express'
import { verifyGuruJwt, KnownJwtError } from '../helpers/jwtManager'
import middlewareVar from '../helpers/middlewareVar'
import isKnownError from '../helpers/isKnownError'
import { DocumentBaseIGuru } from '../models/guru'
import { accountStatus } from '../helpers/accountEnum'

export enum KnownError {
    tokenEmpty = 'Tidak memiliki Akses'
}

export const middlewareVarKey = 'guruAuth'

export interface middlewareBodyType {
    [middlewareVarKey]: DocumentBaseIGuru
}

const guruAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) return res.status(401).send({ message: KnownError.tokenEmpty })

    const token = bearerToken.split(' ')[1]

    try {

        const decodedToken = await verifyGuruJwt(token)
        if (typeof decodedToken === 'string') return res.sendStatus(500)

        if (decodedToken.status === accountStatus.MENUNGGU) {
            return res.sendStatus(401)
        }

        middlewareVar(req, decodedToken, middlewareVarKey)

        next()
    } catch (error) {
        if (isKnownError(error.message, KnownJwtError)) { return res.status(400).send({ message: error.message }) }
        else return res.status(500).send({ message: 'Server Error' })
    }

}


export default guruAuthMiddleware



