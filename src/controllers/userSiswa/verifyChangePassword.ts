import { Request, Response, NextFunction, Router } from 'express'
import { body, validationResult } from 'express-validator'
import { decodeStudentSuperJwt } from '../../helpers/jwtManager'
import handleExpressValidatorError from '../../helpers/handleExpressValidatorError'
import UserSiswaModel from '../../models/userSiswa'

interface BodyType {
    pass: string,
    email: string
}

const verifyChangePassword = async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
    try {
        handleExpressValidatorError(validationResult(req))
        const studentAccountDocument = await UserSiswaModel.findOneByEmail(req.body.email)
        const decodedST = await decodeStudentSuperJwt(studentAccountDocument.superToken)

        if (req.body.pass === decodedST.pass) {
            res.json({
                superToken: studentAccountDocument.superToken
            })
        } else {
            res.sendStatus(401)
        }

    } catch (error) {
        console.log(error);

        next(error)
    }
}

export default verifyChangePassword