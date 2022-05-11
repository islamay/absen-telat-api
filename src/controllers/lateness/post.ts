import { RequestHandler } from 'express'
import { createLateness } from '../../services/lateness'
import { BodyAfterAuth } from '../../middlewares/auth'
import { Purposes } from '../../models/lateness'

interface Body extends BodyAfterAuth {
    nis: string,
    purpose: Purposes
}

const postLateness = (): RequestHandler<{}, {}, Body> => {
    return async (req, res, next) => {
        const { nis, purpose, auth: { teacher } } = req.body

        try {
            const lateness = await createLateness({ nis, purpose, guruId: teacher._id })
            res.type('application/json')
            res.json(lateness)
        } catch (error) {
            next(error)
        }
    }
}

export default postLateness