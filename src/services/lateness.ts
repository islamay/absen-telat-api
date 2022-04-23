import mongoose from 'mongoose'
import Api400Error from '../error/Api400Error'
import SiswaModel from '../models/dataSiswa'
import LatenessModel, { ILatenessDocument, } from '../models/lateness'


export const findByDate = async ({ start, end, startIndex, limit }: { start: Date, end?: Date, startIndex?: number, limit?: number }): Promise<ILatenessDocument[]> => {
    const latenesses = await LatenessModel.find({ date: { $gt: start } }).skip(startIndex).limit(limit)
    return latenesses
}



export const createLateness = async ({ nis, guruId }: { nis: string, guruId: mongoose.Types.ObjectId }) => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const currentDay = currentDate.getDate()
    const tomorrowDate = new Date(currentDate)
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)

    const student = await SiswaModel.findOne({ nis })
    if (!student) throw new Api400Error('ValidationError', 'Nis tidak valid')

    const isAlreadyRecordedToday = await LatenessModel.findOne({
        nis, date: {
            $gte: new Date(currentYear, currentMonth, currentDay),
            $lte: new Date(currentYear, currentMonth, tomorrowDate.getDate())
        }
    }).exec()


    if (isAlreadyRecordedToday) throw new Api400Error('ValidationError', 'Siswa sudah diabsen hari ini')

    const lateness = new LatenessModel({ nis, guruId })
    await lateness.save()
    return lateness
    return true
}