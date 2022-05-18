import { compare } from '../helpers/crypto'
import Api404Error from '../error/Api404Error'
import { AccountStatus } from '../types/account'
import StudentModel, { DocumentBaseDataSiswa, DataSiswa } from '../models/student'
import Api400Error from '../error/Api400Error'

export type CreateStudent = Omit<DataSiswa, 'kelasString' | 'fullClass' | 'hasAccount' | 'account'> & { email: string }

export const createStudent = async (studentData: CreateStudent): Promise<DocumentBaseDataSiswa> => {

    const accountPayload: { tokens: string[], status: AccountStatus } = {
        tokens: [],
        status: AccountStatus.TIDAK_ADA
    }

    if (studentData.email) {
        const isUsed = await StudentModel.findOne({ 'account.email': studentData.email })
        if (isUsed) throw new Api400Error('DuplicateError', 'Email telah dipakai oleh pengguna lain')

        Object.assign(accountPayload, {
            email: studentData.email,
            password: studentData.email + studentData.nis,
            status: AccountStatus.AKTIF,
        })
    }

    const student = new StudentModel({
        ...studentData,
        account: accountPayload
    })
    await student.save()
    return student
}

export const findByNis = async (nis: string): Promise<DocumentBaseDataSiswa> => {
    const student = await StudentModel.findOne({ nis })
    return student
}

export const findByEmail = async (email: string): Promise<DocumentBaseDataSiswa> => {
    const student = await StudentModel.findOne({ 'account.email': email })
    return student
}

export const signIn = async (email: string, password: string) => {
    const student = await StudentModel.findOne({ 'account.email': email })
    if (!student) throw new Api404Error('Email tidak ditemukan untuk pengguna manapun')

    await compare(password, student.account.password)
    const token = await student.generateToken()
    await student.save()
    return {
        student,
        token
    }
}
