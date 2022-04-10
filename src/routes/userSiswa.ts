import express, { Request, Response, NextFunction } from 'express'
import UserSiswaModel, { UserSiswa } from '../models/userSiswa'
import siswaAuthMiddleware, { middlewareBodyType as SiswaMiddlewareBody, middlewareVarKey } from '../middlewares/siswaAuth'
import TerlambatModel from '../models/keterlambatan'
import Api400Error from '../error/Api400Error'
import { check, validationResult, query } from 'express-validator'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'
import createAdminAuthMiddleware from '../middlewares/adminAuth'
import { accountStatus } from '../helpers/accountEnum'
import _ from 'lodash'
import Api404Error from '../error/Api404Error'
import { Types } from 'mongoose'
import SiswaModel from '../models/dataSiswa'

const router = express.Router()

// Create UserSiswa
export default () => {

    {
        interface IQuery {
            status?: accountStatus,
            nama: string
        }
        router.get('/',
            createAdminAuthMiddleware(),
            query('nama')
                .isString()
                .withMessage('Nama harus berupa text'),
            async (req: Request<{}, {}, {}, IQuery>, res: Response, next: NextFunction) => {
                const { nama = null } = req.query

                try {
                    const siswaDocuments = await SiswaModel.findSiswaByName(nama)
                    const nisses = siswaDocuments.map((siswa) => siswa.nis)
                    const userSiswaDocuments = await UserSiswaModel.find({ nis: { $in: nisses } }, ['-password', '-tokens']).populate('siswa').lean()
                    res.json(userSiswaDocuments)
                } catch (error) {
                    next(error)
                }
            }
        )
    }

    router.post('/signup', async (req: Request<{}, {}, Omit<UserSiswa, 'qrcode' | 'status'>>, res: Response, next: NextFunction) => {
        const { nis, email, password } = req.body

        try {
            const [userSiswaDocument, jwt] = await UserSiswaModel.createSiswaUserAndJwt({ nis, email, password })
            const siswaFullData = await userSiswaDocument.getSiswaFullData()
            return res.json({ ...siswaFullData, token: jwt }).status(201)
        } catch (error) {

            next(error)
        }
    })

    {
        enum BodyFields {
            email = 'email',
            password = 'password'
        }
        interface BodyType {
            email: string;
            password: string;
        }
        router.post('/signin',
            check(BodyFields.email)
                .notEmpty()
                .withMessage('Email Harus Diisi')
                .isEmail()
                .withMessage('Email Tidak Valid'),
            check(BodyFields.password)
                .notEmpty()
                .withMessage('Password Harus Diisi')
                .isString()
                .withMessage('Password Harus Berupa Text'),
            async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))

                    const { email, password } = req.body
                    const [UserSiswaDocument, jwt] = await UserSiswaModel.login(email, password)
                    const publicData = UserSiswaDocument.secureData()
                    const siswaFullData = await UserSiswaDocument.getSiswaFullData()

                    return res.json({ ...publicData, ...siswaFullData, token: jwt })

                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        enum BodyFields {
            id = 'id'
        }
        interface BodyType {
            id: string
        }
        router.put('/aktifasi',
            createAdminAuthMiddleware(),
            check(BodyFields.id)
                .notEmpty()
                .withMessage('Id Tidak Boleh Kosong')
                .custom(id => {
                    const isValid = Types.ObjectId.isValid(id)
                    if (!isValid) return Promise.reject('Id Tidak Valid')
                    return true
                }),
            async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))

                    const { id } = req.body
                    const userSiswaDocument = await UserSiswaModel.findById(id)
                    if (!userSiswaDocument) throw new Api404Error(`Siswa Dengan Id ${id} Tidak Ditemukan`)

                    await userSiswaDocument.changeStatus(accountStatus.AKTIF)
                    res.sendStatus(200)

                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        interface BodyType {
            middleware: SiswaMiddlewareBody
        }


        router.get('/saya', siswaAuthMiddleware, async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
            try {
                const { userSiswaDocument } = req.body.middleware.siswaAuth
                const getSiswaFullData = userSiswaDocument.getSiswaFullData()
                const getKeterlambatanDocuments = TerlambatModel.findByNis(userSiswaDocument.nis)
                const promises = [getSiswaFullData, getKeterlambatanDocuments]

                const results = await Promise.all(promises)
                const siswaFullData = results[0]
                const keterlambatanDocuments = results[1]
                const publicData = userSiswaDocument.secureData()


                return res.json({ ...publicData, siswaData: siswaFullData, keterlambatan: keterlambatanDocuments })
            } catch (error) {
                next(error)
            }
        })
    }




    return router
}


