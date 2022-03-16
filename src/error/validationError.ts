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
            super(description || name, error[key])

            this.isMany = false
        } else if (error.length === 1) {
            const key = _.keys(error[0])[0]

            super(description || name, error[0][key])
            this.isMany = false

        } else {
            super(description || name, description || generalValidationError)
            const errors = Object.assign({}, ...error)

            this.isMany = true
            this.errors = errors
        }

    }

    getFormattedError() {
        if (this.isMany) {
            return {
                name: this.name,
                message: this.message,
                errors: this.errors
            }
        } else {
            return {
                name: this.name,
                message: this.message
            }
        }
    }
}


export default ValidationError