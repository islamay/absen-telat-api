import mongoose, { Document } from 'mongoose'

export interface ILateness {
    nis: string,
    alasan: string,
    guruId: mongoose.Types.ObjectId,
    date: Date,
}

export type ILatenessDocument = Document & ILateness

const LatenessSchema = new mongoose.Schema<ILateness>({
    nis: {
        type: String,
        required: true
    },
    alasan: {
        type: String,
    },
    guruId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    },
})

const LatenessModel = mongoose.model<ILateness>('lateness', LatenessSchema)
export default LatenessModel