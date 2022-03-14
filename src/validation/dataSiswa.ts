import _ from 'lodash'
import DataSiswaModel, { DataSiswa, Jurusan } from '../models/dataSiswa'
import Joi from 'joi'
import BaseError from '../errorHandler/baseError'
import { BAD_REQUEST } from '../errorHandler/httpStatusCodes'
import { stringBase, emptyValidationError, requiredValidationError, numberBase, numberInteger, numberMax, numberMin, anyOnly, duplicateKeyErrorMessage } from './validationErrorMessage'
import { duplicateKeyError } from './errorKind'


export const nisValidationErrorMessage = {
    'string.base': stringBase('NIS'),
    'string.empty': emptyValidationError('NIS'),
    'any.required': requiredValidationError('NIS')
}

export const namaLengkapValidationErrorMessage = {
    'string.base': stringBase('Nama Lengkap'),
    'string.empty': emptyValidationError('Nama Lengkap'),
    'any.required': requiredValidationError('Nama Lengkap')
}

export const kelasValidationErrorMessage = {
    'number.base': numberBase('Kelas'),
    'number.integer': numberInteger('Kelas'),
    'any.required': requiredValidationError('Kelas'),
    'number.min': numberMin('Kelas', 10),
    'number.max': numberMax('Kelas', 12),
}

export const nomorKelasValidationErrorMessage = {
    'number.base': numberBase('Nomor Kelas'),
    'number.integer': numberInteger('Nomor Kelas'),
    'number.min': numberMin('Nomor Kelas', 1),
    'number.max': numberMax('Nomor Kelas', 3),
    'any.required': requiredValidationError('Nomor Kelas')
}


export const jurusanValidationErrorMessage = {
    'any.required': requiredValidationError('Jurusan'),
    'any.only': anyOnly('Jurusan')
}

const SiswaDataSchema = Joi.object<Omit<DataSiswa, 'kelasString'>>({
    nis: Joi.string()
        .alphanum()
        .max(25)
        .required()
        .messages(nisValidationErrorMessage),
    namaLengkap: Joi.string()
        .max(100)
        .required()
        .messages(namaLengkapValidationErrorMessage),
    kelas: Joi.number()
        .integer()
        .min(10)
        .max(12)
        .required()
        .messages(kelasValidationErrorMessage),
    kelasNo: Joi.number()
        .integer()
        .min(1)
        .max(3)
        .required()
        .messages(nomorKelasValidationErrorMessage),
    jurusan: Joi.any()
        .valid(Jurusan.DPIB, Jurusan.RPL, Jurusan.TAB, Jurusan.TAV, Jurusan.TITL, Jurusan.TKJ, Jurusan.TKR)
        .required()
        .messages(jurusanValidationErrorMessage)
})

const validateDataSiswaUniqueness = async (dataSiswa: Omit<DataSiswa, 'kelasString'>) => {
    const dataSiswaDocument = await DataSiswaModel.findOne({ nis: dataSiswa.nis })
    if (!_.isNull(dataSiswaDocument)) {
        throw new BaseError(duplicateKeyError, BAD_REQUEST, true, duplicateKeyErrorMessage('nis'))
    }
}

const validateDataSiswa = (dataSiswa: Omit<DataSiswa, 'kelasString'>) => {

    const { nis, namaLengkap, kelas, kelasNo, jurusan } = dataSiswa || null


    const validateDataSiswaParameter = SiswaDataSchema.validate({ nis, namaLengkap, kelas, kelasNo, jurusan })
    if (validateDataSiswaParameter.error instanceof Joi.ValidationError) {
        console.log(validateDataSiswaParameter.error.details);

        throw new BaseError(validateDataSiswaParameter.error.name, BAD_REQUEST, true, validateDataSiswaParameter.error.message)
    }

    validateDataSiswaUniqueness(dataSiswa)
}



export default validateDataSiswa