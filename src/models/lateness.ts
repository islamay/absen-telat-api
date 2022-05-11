import mongoose, { Document } from 'mongoose'

export interface ILateness {
    nis: string,
    alasan: string,
    guruId: mongoose.Types.ObjectId,
    date: Date,
}

export type ILatenessDocument = Document & ILateness

export enum Purposes {
    TidakAda = 'Tidak ada',
    Macet = 'Macet',
    Hujan = 'Hujan',
    KeDokter = 'Ke dokter',
    BanBocor = 'Ban bocor',
    BangunKesiangan = 'Bangun kesiangan',
    MengantarAdikSekolah = 'Mengantar adik ke sekolah',
}

const LatenessSchema = new mongoose.Schema<ILateness>({
    nis: {
        type: String,
        required: true
    },
    alasan: {
        type: String,
        enum: Object.values(Purposes),
        default: Purposes.TidakAda,
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

LatenessSchema.virtual('student', {
    ref: 'student',
    justOne: true,
    localField: 'nis',
    foreignField: 'nis'
})

const LatenessModel = mongoose.model<ILateness>('lateness', LatenessSchema)
export default LatenessModel