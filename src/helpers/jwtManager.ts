import 'dotenv/config'
import jsonwebtoken from 'jsonwebtoken'

export enum KnownJwtError {
    InvalidJwt = "Token Invalid"
}

export const createGuruJWT = async (guruData: string) => {
    const token = await jsonwebtoken.sign(guruData, process.env.GURU_JWT_KEY)
    return token
}

export const verifyGuruJwt = async (token: string) => {
    try {
        const isValidToken = jsonwebtoken.verify(token, process.env.GURU_JWT_KEY)
        return isValidToken
    } catch (error) {
        throw new Error(KnownJwtError.InvalidJwt)
    }
}

export const createMuridJWT = async (nis: string) => {
    const token = await jsonwebtoken.sign(nis, process.env.MURID_JWT_KEY)
    return token
}

export const verifyMuridJwt = async (token: string) => {
    try {
        const isValidToken = jsonwebtoken.verify(token, process.env.MURID_JWT_KEY)
        return isValidToken
    } catch (error) {
        throw new Error(KnownJwtError.InvalidJwt)
    }
}