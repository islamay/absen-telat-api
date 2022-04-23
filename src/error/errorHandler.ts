import { Request, Response, NextFunction } from 'express'
import BaseError from './baseError'
import { JsonWebTokenError } from 'jsonwebtoken'
import Api401Error from './Api401Error'

const logError = () => {

}

const createErrorMiddleware = () => {

    return (err: any, req: Request, res: Response, next: NextFunction) => {

        if (err instanceof BaseError) {
            res.status(err.statusCode)
            res.json(err.getFormattedError())
        } else if (err instanceof JsonWebTokenError) {
            const error = new Api401Error(err.message)
            res.status(error.statusCode)
            res.json(error.getFormattedError())
        } else {
            console.log(err);
            return res.sendStatus(500)
        }
    }
}

export default createErrorMiddleware
