import mongoose, { Model, Document } from 'mongoose'
import { createTeacherJwt } from '../helpers/jwtManager'
import { AccountStatus, TeacherRole } from '../helpers/accountEnum'
import { hash } from '../helpers/crypto'

interface ITeacher {
    nama: string,
    email: string,
    password: string,
    status: AccountStatus,
    role: TeacherRole,
    tokens: { token: string }[],
    superToken: string
}

type SecureTeacherData = Omit<ITeacher, 'password' | 'tokens' | 'superToken'>

interface ITeacherMethods {
    secureData: () => SecureTeacherData,
    generateToken: () => Promise<string>,
    wipeTokens: () => Promise<void>
}

type TeacherDehidrated = Model<ITeacher, {}, ITeacherMethods>
export type TeacherDocument = Document & ITeacher & ITeacherMethods
export type ITeacherModel = Model<ITeacher, {}, ITeacherMethods>

const TeacherSchema = new mongoose.Schema<ITeacher, TeacherDehidrated, ITeacherMethods>({
    nama: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(AccountStatus),
        default: AccountStatus.AKTIF,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(TeacherRole),
        default: TeacherRole.REGULAR,
        required: true
    },
    tokens: [{
        token: { type: String }
    }],
    superToken: {
        type: String
    }
})

TeacherSchema.pre('validate', function (this, next) {
    if (!this.password) {
        this.password = this.email
    }

    next()
})

TeacherSchema.pre('save', async function (this, next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password)
    }

    next()
})


TeacherSchema.methods.secureData = function (this: TeacherDocument) {
    const { nama, email, status, role } = this
    return { nama, email, status, role }
}

TeacherSchema.methods.generateToken = async function (this: TeacherDocument) {
    const { token } = await createTeacherJwt(this)
    this.tokens.push({ token })
    return token
}


const TeacherModel = mongoose.model<ITeacher, ITeacherModel>('teacher', TeacherSchema)

export default TeacherModel