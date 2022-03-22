import 'dotenv/config'
import jsonwebtoken, { JsonWebTokenError } from 'jsonwebtoken'
import _ from 'lodash'
import { Types } from 'mongoose'
import Api401Error from '../error/Api401Error'
import Api500Error from '../error/Api500Error'
import { DocumentBaseIGuru, guruRole } from '../models/guru'
import { DocumentBaseUserSiswa } from '../models/userSiswa'
import { accountRole, accountStatus } from './accountEnum'
import SiswaModel from '../models/dataSiswa'


export enum KnownJwtError {
    InvalidJwt = "Token Invalid"
}


interface jwtPayload {
    _id: Types.ObjectId,
    accType: accountRole,
    accStatus: accountStatus
}

export interface guruJwtPayload extends jwtPayload {
    role: guruRole
}

export interface siswaJwtPayload extends jwtPayload {
    nis: string,
}

const jwtExpiresIn = '30 days'

export const createGuruJWT = async (guruData: DocumentBaseIGuru) => {
    try {
        const { _id, role, status: accStatus } = guruData
        const accType = accountRole.GURU
        const payload: guruJwtPayload = { _id, accStatus, accType, role }
        const token = await jsonwebtoken.sign(payload, process.env.GURU_JWT_KEY, { expiresIn: jwtExpiresIn })
        return token
    } catch (error) {
        console.log(error);
        throw new Api500Error()
    }
}

export const verifyGuruJwt = async (token: string): Promise<jsonwebtoken.JwtPayload & guruJwtPayload> => {
    try {
        const decodedToken = jsonwebtoken.verify(token, process.env.GURU_JWT_KEY)
        if (_.isString(decodedToken)) throw new Api401Error('Invalid Token')

        return (decodedToken as jsonwebtoken.JwtPayload & guruJwtPayload)
    } catch (error) {
        if (error instanceof JsonWebTokenError) throw new Api401Error(error.message)
        else throw error
    }
}

export const createMuridJWT = async (userSiswaDocument: DocumentBaseUserSiswa): Promise<string> => {

    try {
        const siswaDocument = await SiswaModel.findOne({ nis: userSiswaDocument.nis })
        if (!siswaDocument) throw new Api401Error('Token is Invalid')

        const { _id, nis } = siswaDocument
        const payload: siswaJwtPayload = { _id, nis, accType: accountRole.SISWA, accStatus: userSiswaDocument.status }
        const token = await jsonwebtoken.sign(payload, process.env.SISWA_JWT_KEY, { expiresIn: jwtExpiresIn })
        return token
    } catch (error) {
        throw error
    }
}

export const verifyMuridJwt = async (token: string): Promise<jsonwebtoken.JwtPayload & siswaJwtPayload> => {
    try {
        const decodedToken = jsonwebtoken.verify(token, process.env.SISWA_JWT_KEY)
        if (_.isString(decodedToken)) throw new Api401Error('Invalid Token')


        return (decodedToken as jsonwebtoken.JwtPayload & siswaJwtPayload)
    } catch (error) {
        if (error instanceof JsonWebTokenError) throw new Api401Error(error.message)
        else throw error
    }
}