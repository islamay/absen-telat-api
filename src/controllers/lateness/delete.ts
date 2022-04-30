import { RequestHandler } from 'express'
import { BodyAfterGetLatenessById } from '../../middlewares/getLatenessById'

type Body = BodyAfterGetLatenessById;

const deleteLateness = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        try {
            await req.body.lateness.delete()
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
}

export default deleteLateness