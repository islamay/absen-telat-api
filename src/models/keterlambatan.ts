import mongoose, { model, Schema, Types, Model, Document } from 'mongoose'
import Api401Error from '../error/Api401Error'
import Api400Error from '../error/Api400Error'
import Api404Error from '../error/Api404Error'
import GuruModel from './guru'
import UserSiswaModel from './userSiswa'
import Api403Error from '../error/Api403Error'
import { DocumentBaseDataSiswa } from './dataSiswa'

export interface ITelat {
    idGuru: string,
    nis: string,
    alasan: string
    date: Date,
}

export interface ITelatDocument extends ITelat, Document { }

export interface ITelatModel extends Model<ITelatDocument> {
    findByDate(start: Date, end: Date): Promise<ITelatDocument[]>,
    findByNis(nis: string): Promise<ITelatDocument[]>,
    findByIdAndUpdateAlasan(id: Types.ObjectId, nis: string, alasan: string): Promise<void>,
    createOne(payload: Omit<ITelat, 'date'>): Promise<ITelatDocument>
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
},
    {
        toObject: { virtuals: true }
    })

telatSchema.statics.createOne = async function (this: ITelatModel, payload: Omit<ITelat, 'date'>) {
    try {
        const keterlambatanDocument = new this(payload)
        await keterlambatanDocument.save()
        return keterlambatanDocument
    } catch (error) {
        throw error
    }
}

telatSchema.statics.findByNis = async function (this: Model<ITelatDocument>, nis: string) {
    try {
        const keterlambatan = await this.find({ nis: nis })
        return keterlambatan
    } catch (error) {
        return []
    }

}

telatSchema.statics.findByDate = async function (this: ITelatModel, start: Date, end: Date) {
    try {
        const keterlambatanDocuments = await this.find({
            date: {
                $gte: start,
                $lte: end
            }
        })


        return keterlambatanDocuments
    } catch (error) {
        throw error
    }
}

telatSchema.statics.findByIdAndUpdateAlasan = async function (this: ITelatModel, id, nis, alasan) {
    try {
        const keterlambatanDocument = await this.findOne({ _id: id })
        if (!keterlambatanDocument) throw new Api404Error(`Keterlambatan dengan Id ${id} Tidak Ditemukan`)
        if (keterlambatanDocument.nis !== nis) throw new Api403Error('Tidak Memiliki Akses Terhadap Dokumen')

        keterlambatanDocument.alasan = alasan
        await keterlambatanDocument.save()

    } catch (error) {
        throw error
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

telatSchema.virtual('siswa', {
    ref: 'siswa',
    localField: 'nis',
    foreignField: 'nis',
    justOne: true
})

const TerlambatModel = model<ITelatDocument, ITelatModel>('telat', telatSchema, 'telat')
export default TerlambatModel
