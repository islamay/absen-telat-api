import { RequestHandler } from 'express'
import { createLateness } from '../../services/lateness'
import { BodyAfterAuth } from '../../middlewares/auth'

interface Body extends BodyAfterAuth {
    nis: string
}

const postLateness = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { nis } = req.body
        const { teacher } = req.body.auth

        try {
            const lateness = await createLateness({ nis, guruId: teacher._id })
            res.type('application/json')
            res.json(lateness)
        } catch (error) {
            next(error)
        }
    }
}

export default postLateness