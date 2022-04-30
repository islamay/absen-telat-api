import { RequestHandler } from 'express'
import Api404Error from '../error/Api404Error'

const notFound = (): RequestHandler => {

    return (req, res, next) => {
        next(new Api404Error('Page not Found'))
    }
}

export default notFound