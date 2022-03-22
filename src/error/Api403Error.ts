import BaseError from './baseError'

class Api403Error extends BaseError {

    constructor(description: string) {
        const name = 'Forbidden'
        const statusCode = 403
        const isOperational = true

        super(name, statusCode, isOperational, description)
    }
}

export default Api403Error