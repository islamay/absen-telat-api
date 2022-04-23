import mongoose from 'mongoose'
import { AccountStatus } from '../helpers/accountEnum'


export interface StudentAccount {
    email: string,
    password: string,
    status: AccountStatus,
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
        enum: Object.values(AccountStatus),
        default: AccountStatus.MENUNGGU
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





