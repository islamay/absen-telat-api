import { RequestHandler } from 'express'
import { validateTeacherService } from '../../services/teacher'

interface Body {
    email: string,
    password: string
}

const signInTeacher = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { email, password } = req.body

        try {
            const teacher = await validateTeacherService(email, password)
            const token = await teacher.generateToken()
            await teacher.save()

            res.type('application/json')
            res.json({ guru: teacher.secureData(), token })
        } catch (error) {
            next(error)
        }
    }
}

export default signInTeacher