import BaseError from './baseError'
import { INTERNAL_ERROR } from './httpStatusCodes'

class Api500Error extends BaseError {

    constructor(descriptionParam?: string) {
        const name = 'InternalError'
        const statusCode = INTERNAL_ERROR
        const description = descriptionParam || 'There\'s Internal Error'
        const isOperational = false

        super(name, statusCode, isOperational, description)
    }
}

export default Api500Error
