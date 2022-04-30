import { RequestHandler } from 'express'
import Api401Error from '../../error/Api401Error'
import { AccountType } from '../../helpers/accountEnum'
import { BodyAfterAuth } from '../../middlewares/auth'
import { BodyAfterGetLatenessById, ParamsForGetLatenessById } from '../../middlewares/getLatenessById'

interface Body extends BodyAfterGetLatenessById, BodyAfterAuth {
    alasan: string,
}

const patchLateness = (): RequestHandler<{}, {}, Body> => {

    return async (req, res, next) => {
        const { alasan, lateness, auth } = req.body
        try {

            if (auth.type === AccountType.SISWA && auth.student.nis !== lateness.nis) throw new Api401Error('Bukan pemilik dokumen')

            lateness.alasan = alasan
            await lateness.save()

            res.type('application/json')
            res.json(lateness)
        } catch (error) {
            next(error)
        }
    }
}

export default patchLateness