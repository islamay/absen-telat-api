import { RequestHandler } from 'express'
import { AccountStatus, TeacherRole } from '../../helpers/accountEnum'
import { BodyAfterGetTeacherById } from '../../middlewares/getTeacherById'

interface Body extends BodyAfterGetTeacherById {
    status?: AccountStatus,
    role?: TeacherRole
}

const patchTeacher = (): RequestHandler<any, any, Body> => {
    return async (req, res, next) => {
        const { role, status, teacher } = req.body
        console.log(req.body);

        if (!!role) {
            console.log('a');
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