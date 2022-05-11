import { RequestHandler } from 'express'

export interface QueryType {
    page?: number,
    limit?: number
}

export interface WithPagination {
    startIndex: number,
    limit: number
}

const pagination = (): RequestHandler<{}, {}, WithPagination, QueryType> => {

    return (req, res, next) => {
        const page: number = +req.query.page || 1
        const limit: number = +req.query.limit || 10

        req.body.startIndex = (page - 1) * limit
        req.body.limit = limit
        next()
    }
}

export default pagination
