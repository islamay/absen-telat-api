import { RequestHandler } from 'express'
import Api401Error from '../../error/Api401Error'
import { verifyStudentSuperJwt } from '../../helpers/jwtManager'
import splitBearerToken from '../../helpers/splitBearerToken'
import SiswaModel from '../../models/student'
import { findByNis } from '../../services/student'

interface Body {
    password: string
}

interface Params {
    nis: string
}

const changePassword = (): RequestHandler<Params, {}, Body> => {

    return async (req, res, next) => {
        const { nis } = req.params
        const { password } = req.body
        const { authorization: bearerToken } = req.headers

        try {
            const suppliedToken = splitBearerToken(bearerToken)
            const queryStudent = findByNis(nis)
            const validateToken = verifyStudentSuperJwt(suppliedToken)
            const [student, decodedToken] = await Promise.all([queryStudent, validateToken])

            if (student.account.superToken !== suppliedToken) throw new Api401Error('Token tidak valid')

            student.account.password = password
            student.wipeTokens()
            const token = await student.generateToken()
            await student.save()

            const secureData = student.getDataSiswa()

            res.type('application/json')
            res.json({ token, siswa: secureData })

        } catch (error) {
            next(error)
        }
    }
}

export default changePassword