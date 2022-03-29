import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import GuruModel from '../../models/guru'

let connection: typeof mongoose
let mongoServer: MongoMemoryServer

export interface DefaultData {
    adminToken: string
}

const addDefaultData = async (): Promise<DefaultData> => {
    const adminData = { email: 'deanprayoga09@gmail.com', namaLengkap: 'dean prayoga', password: '12345678' }
    const [admin, token] = await GuruModel.createGuruAndJwt(adminData)

    return { adminToken: token }
}

const connect = async () => {
    mongoServer = await MongoMemoryServer.create()
    connection = await mongoose.connect(mongoServer.getUri())
}

const close = async () => {
    await mongoose.connection.close()
    await mongoServer.stop()
}

const clear = async () => {
    const collections = mongoose.connection.collections
    for (const coll in collections) {
        await collections[coll].deleteMany({})
    }
}

export default { connect, close, clear, addDefaultData }