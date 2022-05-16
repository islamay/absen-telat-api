import Api404Error from '../error/Api404Error'
import Api400Error from '../error/Api400Error'
import TeacherModel, { TeacherDocument } from '../models/teacher'
import { compare } from '../helpers/crypto'

export const createTeacherService = async (name: string, email: string): Promise<TeacherDocument> => {
    const teacher = await TeacherModel.findOne({ email })
    if (teacher) throw new Api400Error('ValidationError', 'Email ini sudah dipakai')

    const newTeacher = new TeacherModel({
        nama: name,
        email,
    })

    await newTeacher.save()
    return newTeacher
}

export const validateTeacherService = async (email: string, password: string): Promise<TeacherDocument> => {
    const teacher = await TeacherModel.findOne({ email })
    if (!teacher) throw new Api404Error('Email tidak ditemukan untuk guru manapul')
    await compare(password, teacher.password)
    return teacher
}

export const findByEmail = async (email: string) => {
    const teacher = await TeacherModel.findOne({ email })
    return teacher
}