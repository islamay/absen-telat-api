import { RequestHandler } from 'express'
import { AccountType } from '../helpers/accountEnum'
import TeacherModel, { TeacherDocument, ITeacherModel } from '../models/guru'
import SiswaModel, { DocumentBaseDataSiswa, SiswaModel as ISiswaModel } from '../models/dataSiswa'
import { StudentJwtPayload, TeacherJwtPayload, verifyStudentJwt, verifyTeacherJwt } from '../helpers/jwtManager'
import splitBearerToken from '../helpers/splitBearerToken'
import Api401Error from '../error/Api401Error'


export interface BodyAfterAuth {
    auth: {
        type: AccountType,
        token: string,
        decoded: StudentJwtPayload | TeacherJwtPayload,
        student?: DocumentBaseDataSiswa,
        teacher?: TeacherDocument
    }
}

const auth = (type: AccountType): RequestHandler<{}, {}, BodyAfterAuth> => {

    return async (req, res, next) => {
        let model: ISiswaModel | ITeacherModel;
        const token = splitBearerToken(req.headers.authorization)

        if (type === AccountType.GURU) model = TeacherModel
        else model = SiswaModel


        try {
            const verifyingToken = type === AccountType.GURU ? verifyTeacherJwt(token) : verifyStudentJwt(token)
            const queryingUser = type === AccountType.GURU ? model.findOne({ 'tokens.token': token }) : model.findOne({ account: { 'tokens.token': token } })

            const [decoded, user] = await Promise.all([verifyingToken, queryingUser])

            if (!user) throw new Api401Error('Token invalid')

            req.body.auth = {
                type: type,
                token: token,
                decoded: decoded,
                [type === AccountType.GURU ? 'teacher' : 'student']: user
            }

            next()

        } catch (error) {
            next(error)
        }
    }
}

export default auth