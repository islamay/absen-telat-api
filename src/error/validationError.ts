import { generalValidationError } from '../validation/validationErrorMessage';
import _ from 'lodash'
import Api400Error from './Api400Error';

interface IErrorParam {
    [path: string]: string,
}

type ErrorParam = IErrorParam | IErrorParam[]

class ValidationError extends Api400Error {
    isMany: boolean
    errors?: { [path: string]: string }

    constructor(error: ErrorParam, description?: string) {
        const name = 'ValidationError'

        if (!_.isArray(error)) {
            const key = _.keys(error)[0]
            super(name, error[key])

            this.isMany = false
        } else {
            super(name, description || generalValidationError)
            const errors = Object.assign({}, ...error)

            this.isMany = true
            this.errors = errors
        }

    }
}


export default ValidationError