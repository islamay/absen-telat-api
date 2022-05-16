import { RequestHandler } from 'express'

interface Query {
    token: string,
}

const resetPassword = (): RequestHandler<{}, {}, {}, Query> => {

    return (req, res) => {
        const { token } = req.query
        res.render('reset-password', { token })
    }
}

export default resetPassword