import Joi from 'joi'
import Api400Error from '../error/Api400Error'
import { UserSiswa } from '../models/userSiswa'
import { emptyValidationError, requiredValidationError, stringBase, stringEmail, stringMax, stringMin } from './validationErrorMessage'
import validateUniqueness from './validateUniqueness'
import DataSiswaModel from '../models/dataSiswa'
import UserSiswaModel from '../models/userSiswa'
import _ from 'lodash'
import ValidationError from '../error/validationError'

const nisErrorMessages = {
    'string.base': stringBase('NIS'),
    'string.empty': emptyValidationError('NIS'),
    'any.required': requiredValidationError('NIS'),
}

const emailErrorMessages = {
    'string.base': stringBase('Email'),
    'string.empty': emptyValidationError('Email'),
    'any.required': requiredValidationError('Email'),
    'string.email': stringEmail('Email')
}

const passwordErrorMessages = {
    'string.base': stringBase('Password'),
    'string.empty': emptyValidationError('Password'),
    'string.min': stringMin('Password', 8),
    'string.max': stringMax('Password', 50),
    'any.required': requiredValidationError('Password'),
}

const userSiswaSchema = Joi.object<Omit<UserSiswa, 'status' | 'qrcode'>>({
    nis: Joi.string()
        .alphanum()
        .max(30)
        .required()
        .messages(nisErrorMessages),
    email: Joi.string()
        .email()
        .max(50)
        .required()
        .messages(emailErrorMessages),
    password: Joi.string()
        .min(8)
        .max(50)
        .required()
        .messages(passwordErrorMessages),
})

const isValidNis = async (nis: string) => {
    const isExist = await DataSiswaModel.exists({ nis })

    return !!isExist
}

const validateUserSiswa = async (userSiswa: Omit<UserSiswa, 'status' | 'qrcode'>) => {
    const { nis, email, password } = userSiswa || null

    const validateUserSiswaParameterResult = userSiswaSchema.validate({ nis, email, password })
    if (validateUserSiswaParameterResult.error instanceof Joi.ValidationError) {

        throw new Api400Error('ValidationError', validateUserSiswaParameterResult.error.message)
    }

    const isThisValidNis = await isValidNis(nis)
    if (!isThisValidNis) {
        throw new ValidationError({ nis: 'Nis Tidak Valid' })
    }

    const errors = await validateUniqueness([{ path: 'nis', payload: userSiswa.nis }, { path: 'email', payload: userSiswa.email }], UserSiswaModel)
    if (errors) {
        throw new ValidationError(errors, 'Duplicate Key Error')
    } else {
    }

}

export default validateUserSiswa