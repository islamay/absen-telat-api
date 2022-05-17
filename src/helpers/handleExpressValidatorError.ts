import { Result, ValidationError } from 'express-validator'
import Api400Error from '../error/Api400Error'

const handleExpressValidatorError = (result: Result<ValidationError>) => {
    if (!result.isEmpty()) {
        const firstError = result.array()[0]
        throw new Api400Error('ValidationError', firstError.msg)
    }
}

export default handleExpressValidatorError