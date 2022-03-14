import mongoose, { model, Schema, Types, Model, Document } from 'mongoose'
import GuruModel from './guru'
import UserSiswaModel from './userSiswa'

export interface ITelat {
    idGuru: string,
    nis: string,
    alasan: string
    date: Date,
}

export interface ITelatDocument extends ITelat, Document { }

export interface ITelatModel extends Model<ITelatDocument> {
    findByNis(nis: string): Promise<ITelatDocument[]>
}

export enum KnownError {
    InvalidGuruId = 'Id Guru Invalid',
    InvalidSiswaNis = 'Nis Siswa Invalid'
}


const telatSchema = new Schema<ITelat, {}, {}>({
    idGuru: {
        type: String,
        required: true
    },
    nis: {
        type: String,
        required: true
    },
    alasan: {
        type: String,
        required: false,
        default: ''
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

telatSchema.statics.findByNis = async function (this: Model<ITelatDocument>, nis: string) {
    try {
        const keterlambatan = await this.find({ nis: nis })
        return keterlambatan
    } catch (error) {
        return []
    }

}

telatSchema.pre('validate', async function (next) {
    const { idGuru, nis } = this


    if (!Types.ObjectId.isValid(idGuru)) {
        const error = new Error(KnownError.InvalidGuruId)
        return next(error)
    }

    try {
        const guruExist = await GuruModel.findOne({ _id: idGuru })
        if (!guruExist) {
            const error = new Error(KnownError.InvalidGuruId)
            return next(error)
        }

        const siswaExist = await UserSiswaModel.findOne({ nis: nis })
        if (!siswaExist) {
            const error = new Error(KnownError.InvalidSiswaNis)
            return next(error)
        }

        return next()
    } catch (error) {
        return next(error)
    }
})

const TerlambatModel = model<ITelatDocument, ITelatModel>('telat', telatSchema, 'telat')
export default TerlambatModel

