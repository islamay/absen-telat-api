import { RequestHandler } from 'express'
import { AccountStatus } from '../../types/account'
import { TeacherRole } from '../../types/teacher'
import { BodyAfterGetTeacherById } from '../../middlewares/getTeacherById'

interface Body extends BodyAfterGetTeacherById {
    status?: AccountStatus,
    role?: TeacherRole
}

const patchTeacher = (): RequestHandler<any, any, Body> => {
    return async (req, res, next) => {
        const { role, status, teacher } = req.body

        if (!!role) {
            teacher.role = role
        }
        if (!!status) teacher.status = status

        try {
            await teacher.save()
            res.type('application/json')
            res.json(teacher.secureData())
        } catch (error) {
            next(error)
        }
    }
}

export default patchTeacher