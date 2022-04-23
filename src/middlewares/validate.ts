import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import handleExpressValidatorError from '../helpers/handleExpressValidatorError'

const validate = (): RequestHandler => {

    return (req, res, next) => {
        try {
            const result = validationResult(req)
            handleExpressValidatorError(result)
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default validate

