import { RequestHandler } from 'express'
import TeacherModel, { TeacherDocument } from '../models/teacher'
import { Types } from 'mongoose'
import Api400Error from '../error/Api400Error'
import Api404Error from '../error/Api404Error'
import { BodyAfterAuth } from './auth'

interface Params {
    id: string
}

export interface BodyAfterGetTeacherById extends BodyAfterAuth {
    teacher: TeacherDocument
}

const getTeacherById = (send: boolean = false): RequestHandler<Params, {}, BodyAfterGetTeacherById> => {

    return async (req, res, next) => {
        const { id } = req.params
        try {

            if (!Types.ObjectId.isValid(id)) throw new Api400Error('ValidationError', 'Id tidak valid')
            const teacher = await TeacherModel.findOne({ _id: id })
            if (!teacher) throw new Api404Error('Pengajar tidak ditemukan')
            if (send) {
                res.type('application/json')
                res.json(teacher.secureData())
                return;
            }

            req.body.teacher = teacher
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default getTeacherById