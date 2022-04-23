import mongoose from 'mongoose'
import { accountStatus } from '../helpers/accountEnum'


export interface StudentAccount {
    email: string,
    password: string,
    status: accountStatus,
    tokens: { token: string }[],
    superToken: string
}

const studentAccountSchema = new mongoose.Schema<StudentAccount>({
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        enum: Object.values(accountStatus),
        default: accountStatus.MENUNGGU
    },
    tokens: {
        type: [{
            token: String
        }]
    },
    superToken: {
        type: String
    }
})

export default studentAccountSchema





