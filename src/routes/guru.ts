import handleExpressValidatorError from '../helpers/handleExpressValidatorError'
import guruAuthMiddleware, { middlewareBodyType } from '../middlewares/guruAuth'
import GuruModel, { IGuruAsParam, guruRole } from '../models/guru'
import express, { Request, Response, NextFunction } from 'express'
import createAdminAuthMiddleware from '../middlewares/adminAuth'
import { check, validationResult } from 'express-validator'
import { accountStatus } from '../helpers/accountEnum'
import Api401Error from '../error/Api401Error'
import Api404Error from '../error/Api404Error'
import { Types } from 'mongoose'
import _ from 'lodash'


const router = express.Router()

const createRoutes = () => {
    const adminAuthMiddleware = createAdminAuthMiddleware()

    {
        interface ReqQuery {
            status?: guruRole,
        }
        router.get('/',
            adminAuthMiddleware,
            async (req: Request<{}, {}, {}, ReqQuery>, res: Response, next: NextFunction) => {
                const query = {}
                if (_.isString(req.query.status)) _.assign(query, { status: req.query.status })

                try {
                    const guruDocuments = await GuruModel.find(query)
                    if (_.isEmpty(guruDocuments)) throw new Api404Error('Guru Tidak Ditemukan')

                    res.status(200).json(guruDocuments)
                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        enum bodyEnum {
            namaLengkap = 'namaLengkap',
            email = 'email',
            password = 'password'
        }
        type BodyType = IGuruAsParam;
        router.post('/signup', adminAuthMiddleware,
            check(bodyEnum.namaLengkap)
                .notEmpty()
                .withMessage('Nama Lengkap Harus Diisi')
                .isString()
                .withMessage('Nama Lengkap Harus Berupa Text'),
            check(bodyEnum.email)
                .notEmpty()
                .withMessage('Email Harus Diisi')
                .isEmail()
                .withMessage('Email Tidak Valid'),
            check(bodyEnum.password)
                .notEmpty()
                .withMessage('Password Harus Diisi'),
            async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))
                    const [guruDocument, jwt] = await GuruModel.createGuruAndJwt(req.body)
                    const guruPublicData = guruDocument.secureData()
                    res.status(201).json(_.assign(guruPublicData, { token: jwt }))
                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        enum bodyField {
            email = 'email',
            password = 'password'
        }
        type ThisBodyType = { email: string, password: string };
        router.post('/signin',
            check(bodyField.email)
                .notEmpty()
                .withMessage('Email Harus Diisi')
                .isEmail()
                .withMessage('Email Tidak Valid'),
            check(bodyField.password)
                .notEmpty()
                .withMessage('Password Harus Diisi')
                .isString()
                .withMessage('Password Harus Berupa Text')
            ,
            async (req: Request<{}, {}, ThisBodyType>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))

                    const { email, password } = req.body
                    const [guruDocument, jwt] = await GuruModel.login(email, password)
                    const publicData = guruDocument.secureData()
                    return res.json({ ...publicData, token: jwt })
                } catch (error) {
                    return next(error)
                }

            })
    }

    {
        interface BodyType {
            middleware: middlewareBodyType
        }
        router.get('/signout',
            guruAuthMiddleware,
            async (req: Request<{}, {}, BodyType>, res: Response, next: NextFunction) => {
                const { guruDocument, token } = req.body.middleware.guruAuth
                try {
                    await guruDocument.removeToken(token)
                    res.sendStatus(200)
                } catch (error) {
                    next(error)
                }
            }
        )
    }

    {
        enum bodyFields {
            id = 'id'
        }
        type ReqBody = { id: string };
        router.put('/aktivasi',
            adminAuthMiddleware,
            check(bodyFields.id)
                .notEmpty()
                .withMessage('Id Harus Diisi')
                .custom(value => {
                    const isValid = Types.ObjectId.isValid(value)
                    if (!isValid) return Promise.reject('Id Tidak Valid')
                    return true
                }),
            async (req: Request<{}, {}, ReqBody>, res: Response, next: NextFunction) => {
                try {
                    handleExpressValidatorError(validationResult(req))

                    const { id } = req.body
                    const guruDocoment = await GuruModel.findById(id)
                    if (!guruDocoment) throw new Api401Error(`Guru Dengan Id ${id} Tidak Ditemukan`)
                    await guruDocoment.changeStatus(accountStatus.AKTIF)
                    res.sendStatus(200)
                } catch (error) {
                    console.log(error);

                    next(error)
                }
            }
        )
    }

    return router
}

export default createRoutes