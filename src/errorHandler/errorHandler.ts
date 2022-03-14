import { Request, Response, NextFunction } from 'express'
import BaseError from './baseError'

const logError = () => {

}

const createErrorMiddleware = () => {

    return (err: any, req: Request, res: Response, next: NextFunction) => {

        if (err instanceof BaseError) {
            res.status(err.statusCode)
            res.json(err.getErrorNameAndDescriptionObject())
        } else {
            return res.sendStatus(500)
        }
    }
}

export default createErrorMiddleware