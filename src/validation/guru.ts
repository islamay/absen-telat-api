import Joi from 'joi';
import _ from 'lodash';
import UniquenessError from '../error/UniquenessError';
import Api400Error from '../error/Api400Error';
import GuruModel, { IGuruAsParam } from '../models/guru'
import validateUniqueness from './validateUniqueness';
import { emptyValidationError, stringBase, stringMax, stringMin } from './validationErrorMessage'

const namaLengkapErrorMessages = {
    'base.string': stringBase('Nama Lengkap'),
    'string.min': stringMin('Nama Lengkap', 3),
    'string.max': stringMax('Nama Lengkap', 100),
    'anyl.empty': emptyValidationError('Nama Lengkap'),

}

const guruSchema = Joi.object<IGuruAsParam>({
    namaLengkap: Joi.string()
        .min(3)
        .max(100)
        .required(),
    email: Joi.string()
        .email()
        .max(100)
        .required(),
    password: Joi.string()
        .min(8)
        .max(100)
        .required()
})

const validateGuru = async (guru: IGuruAsParam) => {
    const { namaLengkap, email, password } = guru || null

    const validateGuruParamaterResult = guruSchema.validate({ namaLengkap, email, password })
    if (validateGuruParamaterResult.error instanceof Joi.ValidationError) {
        throw new Api400Error('ValidationError', validateGuruParamaterResult.error.message)
    }

    const error = await validateUniqueness({ path: 'email', payload: email }, GuruModel)
    if (error) {
        throw new UniquenessError(error)
    }
}

export default validateGuru