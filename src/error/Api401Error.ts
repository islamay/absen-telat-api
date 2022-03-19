import BaseError from './baseError'
import { UNAUTHENTICATED } from './httpStatusCodes'

class Api401Error extends BaseError {

    constructor(description: string) {
        const name = 'Unauthorized'
        const statusCode = UNAUTHENTICATED
        const isOperational = true

        super(name, statusCode, isOperational, description)
    }
}

export default Api401Error