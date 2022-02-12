import mongoose, { model, Schema, Types } from 'mongoose'

export interface ITelat {
    idGuru: string,
    nis: string,
    date: Date
}

export enum KnownError {
    InvalidGuruId = 'Id Guru Invalid'
}

console.log(KnownError);


const telatSchema = new Schema<ITelat, {}, {}>({
    idGuru: {
        type: String,
        required: true
    },
    nis: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default() {
            const date = new Date()
            return date
        }
    }
})

telatSchema.pre('validate', async function (next) {
    const { idGuru } = this

    if (!Types.ObjectId.isValid(idGuru)) {
        const error = new Error(KnownError.InvalidGuruId)
        return next(error)
    }

    try {
        const exist = await TerlambatModel.findOne({ _id: idGuru })
        if (!exist) {
            const error = new Error(KnownError.InvalidGuruId)
            return next(error)
        }
        return next()
    } catch (error) {
        return next(error)
    }
})

const TerlambatModel = model<ITelat>('telat', telatSchema, 'telat')
export default TerlambatModel

