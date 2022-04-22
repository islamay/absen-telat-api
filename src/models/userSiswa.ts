import mongoose from 'mongoose'
import { accountStatus } from '../helpers/accountEnum'


export interface StudentAccount {
    email: string,
    password: string,
    status: accountStatus,
    tokens: {
        token: string,
    }[],
    superToken: string
}

const studentAccountSchema = new mongoose.Schema<StudentAccount>({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: accountStatus,
        default: accountStatus.MENUNGGU
    },
    tokens: [{
        type: String,
    }],
    superToken: {
        type: String
    }
})

export default studentAccountSchema





