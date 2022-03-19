import BaseError from './baseError'
import { NOT_FOUND } from './httpStatusCodes'

class Api404Error extends BaseError {

    constructor(description: string) {
        const name = 'NotFound'
        const statusCode = NOT_FOUND
        const isOperational = true


        super(name, statusCode, isOperational, description)
    }
}

export default Api404Error