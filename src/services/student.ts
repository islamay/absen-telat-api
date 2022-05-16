import { compare } from '../helpers/crypto'
import Api404Error from '../error/Api404Error'
import { AccountStatus } from '../helpers/accountEnum'
import StudentModel, { DocumentBaseDataSiswa, DataSiswa } from '../models/student'

export type CreateStudent = Omit<DataSiswa, 'kelasString' | 'fullClass' | 'hasAccount' | 'account'> & { email: string }

export const createStudent = async (studentData: CreateStudent): Promise<DocumentBaseDataSiswa> => {
    const student = new StudentModel({
        ...studentData,
        account: {
            email: studentData.email,
            password: studentData.email + studentData.nis,
            status: AccountStatus.AKTIF,
            tokens: [],
        }
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
    const token = student.generateToken()
    await student.save()
    return token
}

export const sendResetPasswordLinkToEmail = async (email: string): Promise<void> => {

}
