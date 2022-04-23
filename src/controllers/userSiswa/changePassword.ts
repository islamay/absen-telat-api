import { Router, Request, Response, NextFunction } from 'express'
import { header, body, validationResult } from 'express-validator'
import UserSiswaModel, { DocumentBaseUserSiswa } from '../../models/userSiswa'
import handleExpressValidatorError from '../../helpers/handleExpressValidatorError'
import { decodeStudentSuperJwt, verifyStudentSuperJwt } from '../../helpers/jwtManager'



interface BodyAfterMiddleware {
    password: string
}

interface BodyType extends BodyAfterMiddleware {
    studentAccountDocument: DocumentBaseUserSiswa
}

const changePassword = async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
    try {
        handleExpressValidatorError(validationResult(req))

        await req.body.studentAccountDocument.changePassword(req.body.password)
        return res.sendStatus(200)

    } catch (error) {
        next(error)
    }
}

export default changePassword


