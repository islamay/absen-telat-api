import { RequestHandler } from 'express'
import TeacherModel from '../../models/teacher'
import { verifyTeacherSuperJwt } from '../../helpers/jwtManager'

interface Body {
    superToken: string,
    password: string
}

const putResetPassword = (): RequestHandler<{}, {}, Body> => {

    return async (req, res) => {
        const { superToken, password } = req.body


        try {
            await verifyTeacherSuperJwt(superToken)
            const teacher = await TeacherModel.findOne({ superToken })
            if (!teacher) {
                res.status(401)
                res.render('reset-password-result', {
                    isSuccess: false
                })
                return;
            }
            teacher.password = password
            teacher.wipeTokens()
            teacher.wipeSuperToken()
            await teacher.save()
            res.status(200)
            res.render('reset-password-result', {
                isSuccess: true,
            })
        } catch (error) {
            res.status(401)
            res.render('reset-password-result', {
                isSuccess: false
            })
        }
    }
}

export default putResetPassword