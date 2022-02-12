
import mongoose from 'mongoose'

export default async (uri: string) => {
    return mongoose.connect(uri)
}