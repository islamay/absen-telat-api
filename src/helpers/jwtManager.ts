import 'dotenv/config'
import jsonwebtoken from 'jsonwebtoken'
import _ from 'lodash'
import { Types } from 'mongoose'
import { AccountType, AccountStatus, } from '../types/account'
import { TeacherRole } from '../types/teacher'
import { DocumentBaseDataSiswa } from '../models/student'
import { TeacherDocument } from '../models/teacher'


export enum KnownJwtError {
    InvalidJwt = "Token Invalid"
}


interface jwtPayload {
    _id: Types.ObjectId,
    type: AccountType,
    status: AccountStatus
}

export interface TeacherJwtPayload extends jwtPayload {
    role: TeacherRole
}

export interface TeacherSuperJwtPayload {

}

export interface StudentJwtPayload extends jwtPayload {
    nis: string,
}

export interface StudentSuperJwtPayload {
    nis: string,
    pass: string
}

const jwtExpiresIn = '30 days'


const getKey = (accType: AccountType, superJwt?: boolean) => {
    let key: string;
    if (accType === AccountType.GURU) {
        if (superJwt) key = process.env.GURU_SUPER_JWT_KEY
        else key = process.env.GURU_JWT_KEY
    } else {
        if (superJwt) key = process.env.SISWA_SUPER_JWT_KEY
        else key = process.env.SISWA_JWT_KEY
    }
    return key
}

const createJwt = async <T extends { [Key: string]: any }>(accType: AccountType, payload: T, superJwt?: boolean) => {
    const key = getKey(accType, superJwt)
    const token = await jsonwebtoken.sign(payload, key, { expiresIn: jwtExpiresIn })
    return token
}

const verifyJwt = async <T extends { [Key: string]: any }>(accType: AccountType, token: string, superJwt?: boolean) => {
    const key = getKey(accType, superJwt)
    const decoded = await jsonwebtoken.verify(token, key)
    return (decoded as T)
}

export const createTeacherJwt = async (teacherDocument: TeacherDocument) => {
    const payload: TeacherJwtPayload = { _id: teacherDocument._id, status: teacherDocument.status, role: teacherDocument.role, type: AccountType.GURU }
    const token = await createJwt(AccountType.GURU, payload)
    return { token, payload }
}

export const createTeacherSuperJwt = async (teacherDocument: TeacherDocument) => {
    const payload: TeacherSuperJwtPayload = {}
    const token = await createJwt(AccountType.GURU, payload, true)
    return { token, payload }
}

export const createStudentJwt = async (studentDocument: DocumentBaseDataSiswa) => {
    const payload: StudentJwtPayload = { _id: studentDocument._id, nis: studentDocument.nis, status: studentDocument.account.status, type: AccountType.SISWA }
    const token = await createJwt(AccountType.SISWA, payload)
    return { token, payload }
}

export const createStudentSuperJwt = async (studentDocument: DocumentBaseDataSiswa) => {
    const payload: StudentSuperJwtPayload = { nis: studentDocument.nis, pass: Math.floor(100000 + Math.random() * 900000).toString() }
    const token = await createJwt(AccountType.SISWA, payload, true)
    return { token, payload }
}

export const verifyTeacherJwt = async (token: string) => {
    const payload = await verifyJwt<TeacherJwtPayload>(AccountType.GURU, token)
    return payload
}

export const verifyTeacherSuperJwt = async (token: string) => {
    const payload = await verifyJwt<TeacherSuperJwtPayload>(AccountType.GURU, token, true)
    return payload
}

export const verifyStudentJwt = async (token: string) => {
    const payload = await verifyJwt<StudentJwtPayload>(AccountType.SISWA, token)
    return payload
}

export const verifyStudentSuperJwt = async (token: string) => {
    const payload = await verifyJwt<StudentSuperJwtPayload>(AccountType.SISWA, token, true)
    return payload
}