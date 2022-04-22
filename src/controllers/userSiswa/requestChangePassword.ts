import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import handleExpressValidatorError from '../../helpers/handleExpressValidatorError'
import UserSiswaModel from '../../models/userSiswa'
import Api404Error from '../../error/Api404Error'
import { decodeStudentSuperJwt } from '../..//helpers/jwtManager'
import { sendMail } from '../../helpers/mailer'
import { createPasswordResetEmail } from '../../helpers/emailContent'

interface Body {
    email: string
}

const requestChangePasswe = async (req: Request<{}, {}, Body>, res: Response, next: NextFunction) => {
    try {
        handleExpressValidatorError(validationResult(req))

        const siswaAccount = await UserSiswaModel.findOneByEmail(req.body.email)
        if (!siswaAccount) throw new Api404Error('tidak ada pengguna dengan email tersebut')


        const superToken = await siswaAccount.createSuperToken()
        const decodedST = await decodeStudentSuperJwt(superToken)

        await sendMail(req.body.email, 'Permintaan mengganti password', createPasswordResetEmail(siswaAccount.email, decodedST.pass))

        res.sendStatus(200)

    } catch (error) {
        console.log(error);

        next(error)
    }
}

export default requestChangePasswe