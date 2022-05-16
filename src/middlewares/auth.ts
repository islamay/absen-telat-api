import { NextFunction, RequestHandler, Request, Response } from 'express'
import { AccountType, TeacherRole } from '../helpers/accountEnum'
import TeacherModel, { TeacherDocument, ITeacherModel } from '../models/teacher'
import StudentModel, { DocumentBaseDataSiswa, StudentModel as IStudentModel } from '../models/student'
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


type AuthenticateProcess<T1 = {}, T2 = {}, T3 = {}> = (req: Request<T1, {}, BodyAfterAuth & T2, T3>) => Promise<void>
type Authenticate = <T1 = {}, T2 = {}, T3 = {}>(type: AccountType, cb?: (req: Request<T1, {}, BodyAfterAuth & T2, T3>) => void | Promise<void>) => AuthenticateProcess<T1, T2, T3>
type AuthIn<T1 = {}, T2 = {}, T3 = {}> = (auths: AuthenticateProcess[]) => RequestHandler<T1, {}, BodyAfterAuth & T2, T3>
type AdminAuth = (req: Request<{}, {}, BodyAfterAuth>) => void | Promise<void>

export const authenticate: Authenticate = (type, cb) => {
    let model: IStudentModel | ITeacherModel;

    if (type === AccountType.GURU) model = TeacherModel
    else model = StudentModel

    return async (req) => {
        const token = splitBearerToken(req.headers.authorization)

        const verifyingToken = type === AccountType.GURU ? verifyTeacherJwt(token) : verifyStudentJwt(token)
        const queryingUser = type === AccountType.GURU ? model.findOne({ 'tokens.token': token }) : model.findOne({ 'account.tokens.token': token })

        const [decoded, user] = await Promise.all([verifyingToken, queryingUser])

        if (!user) throw new Api401Error('Token invalid')

        req.body.auth = {
            type: type,
            token: token,
            decoded: decoded,
            [type === AccountType.GURU ? 'teacher' : 'student']: user
        }

        if (cb) {

            await cb(req)
            return;
        }
        return;

    }
}

export const adminAuth: AdminAuth = (req) => {

    if (req.body.auth.teacher.role !== TeacherRole.ADMIN) throw new Api401Error('Bukan admin')
}

export const authIn: AuthIn = (authArray) => {

    return async (req, res, next) => {
        try {
            const promises = authArray.map(v => v(req))
            await Promise.any(promises)
            next()
        } catch (error) {
            next(new Api401Error('Token tidak valid'))
        }
    }
}