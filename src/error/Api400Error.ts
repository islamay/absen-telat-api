import BaseError from './baseError';
import { BAD_REQUEST } from './httpStatusCodes'


class Api400Error extends BaseError {
    constructor(name: string, description: string) {
        const statusCode = BAD_REQUEST
        const isOperational = true
        super(name, statusCode, isOperational, description)
    }
}

export default Api400Error