import { RequestHandler } from 'express'
import TeacherModel from '../../models/teacher'
import { BodyAfterAuth } from '../../middlewares/auth'
import { WithPagination } from '../../middlewares/pagination'

interface Query {
    nama?: string
}

type Body = WithPagination;

const getTeachers = (): RequestHandler<{}, {}, Body, Query> => {

    return async (req, res, next) => {
        const { limit, startIndex } = req.body
        const { nama: name = '' } = req.query

        try {
            const teachers = await TeacherModel.find({ nama: { $regex: name, $options: 'i' } }).limit(limit).skip(startIndex)
            const secureTeachers = teachers.map(t => t.secureData())
            res.json(secureTeachers)
        } catch (error) {
            next(error)
        }
    }
}

export default getTeachers