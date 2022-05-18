import mongoose from 'mongoose'
import Api400Error from '../error/Api400Error'
import SiswaModel from '../models/student'
import LatenessModel, { ILatenessDocument, Purposes, } from '../models/lateness'


export const findByDate = async ({ start, end, startIndex, limit }: { start: Date, end?: Date, startIndex?: number, limit?: number }): Promise<ILatenessDocument[]> => {
    const latenesses = await LatenessModel.find({ date: { $gt: start } }).skip(startIndex).limit(limit)
    return latenesses
}



export const createLateness = async ({ nis, purpose, guruId }: { nis: string, purpose: Purposes, guruId: mongoose.Types.ObjectId }) => {
    const currentDate = new Date()
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const student = await SiswaModel.findOne({ nis })
    if (!student) throw new Api400Error('ValidationError', 'Nis tidak valid')

    const isAlreadyRecordedToday = await LatenessModel.findOne({
        nis, date: {
            $gte: today,
            $lt: tomorrow,
        }
    }).exec()



    if (isAlreadyRecordedToday) throw new Api400Error('ValidationError', 'Siswa sudah diabsen hari ini')

    const lateness = new LatenessModel({ nis, guruId })
    await lateness.save()
    return lateness
}