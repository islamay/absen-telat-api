import { RequestHandler } from 'express'
import { createTeacherService } from '../../services/teacher'
import { BodyAfterAuth } from '../../middlewares/auth'

interface Body extends BodyAfterAuth {
    nama: string,
    email: string,
}

const createTeacher = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { nama, email } = req.body

        try {
            const teacher = await createTeacherService(nama, email)
            res.type('application/json')
            res.status(201)
            res.json(teacher.secureData())
        } catch (error) {
            next(error)
        }
    }
}

export default createTeacher