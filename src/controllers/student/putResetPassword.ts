import { RequestHandler } from 'express'
import StudentModel from '../../models/student'
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
            const student = await StudentModel.findOne({ 'account.superToken': superToken })
            if (!student) {
                res.status(401)
                res.render('reset-password-result', {
                    isSuccess: false
                })
                return;
            }
            student.account.password = password
            student.wipeTokens()
            student.wipeSuperToken()
            await student.save()
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