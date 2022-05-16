import { compare } from 'bcrypt';
import mongoose, { Document, Model } from 'mongoose'
import { createStudentJwt } from '../helpers/jwtManager';
import Api401Error from '../error/Api401Error';
import Api404Error from '../error/Api404Error';
import enumValues from '../helpers/enumValues'
import { hash } from '../helpers/crypto';
import { AccountStatus } from '../helpers/accountEnum';
import _ from 'lodash';

const generateKelasString = function (kelas: Kelas) {
    switch (kelas) {
        case Kelas.X:
            return kelasString.X
        case Kelas.XI:
            return kelasString.XI
        case Kelas.XII:
            return kelasString.XII
        case Kelas.XIII:
            return kelasString.XIII
    }
}

export enum Kelas {
    X = 10,
    XI = 11,
    XII = 12,
    XIII = 13
}

export enum kelasString {
    X = 'X',
    XI = 'XI',
    XII = 'XII',
    XIII = 'XIII'
}

export enum Jurusan {
    RPL = 'RPL',
    TKJ = 'TKJ',
    TKR = 'TKR',
    TAB = 'TAB',
    TAV = 'TAV',
    TITL = 'TITL',
    DPIB = 'DPIB'
}
export interface DataSiswa {
    nis: string,
    namaLengkap: string,
    kelas: number,
    kelasString: kelasString,
    kelasNo: number,
    jurusan: Jurusan,
    fullClass: string,
    hasAccount: boolean,
    account: StudentAccount,
}
type SecureStudentData = Omit<DataSiswa, 'account'> & { account: SecureStudentAccountData }
type SecureStudentAccountData = Omit<StudentAccount, 'password' | 'tokens' | 'superToken'>
export interface DataSiswaMethods {
    getDataSiswa: () => Omit<DataSiswa, 'account'> & { account: Omit<StudentAccount, 'password' | 'tokens' | 'superToken'> },
    generateToken: () => Promise<string>,
    wipeTokens: () => void,
    wipeSuperToken: () => void,
}

export type DocumentBaseDataSiswa = Document & DataSiswa & DataSiswaMethods;

export interface StudentModel extends Model<DataSiswa, {}, DataSiswaMethods> {
}

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

const siswaSchema = new mongoose.Schema<DataSiswa, {}, DataSiswaMethods>({
    nis: {
        type: String,
        required: [true, 'NIS Harus Diisi'],
        unique: true,
        maxlength: 100
    },
    namaLengkap: {
        type: String,
        required: [true, 'Nama Lengkap Harus Diisi'],
        maxlength: 100
    },
    kelas: {
        type: Number,
        enum: Kelas,
        required: [true, 'Kelas Harus Diisi']
    },
    kelasString: {
        type: String,
        enum: kelasString,
        required: true,
        default: function (this: DocumentBaseDataSiswa) {
            return generateKelasString(this.kelas)
        }
    },
    kelasNo: {
        type: Number,
        required: [true, 'Nomor Kelas Harus Diisi']
    },
    jurusan: {
        type: String,
        required: [true, 'Jurusan Harus Diisi'],
        enum: { values: enumValues(Jurusan), message: 'Jurusan Tidak Valid' }
    },
    fullClass: {
        type: String,
        required: true,
        default: function (this: DocumentBaseDataSiswa) {
            if (this.kelasNo === 1) {
                const fullClass = `${this.kelasString} ${this.jurusan}`
                return fullClass
            } else {
                const fullClass = `${this.kelasString} ${this.jurusan} ${this.kelasNo}`
                return fullClass
            }
        }
    },
    account: {
        type: studentAccountSchema,
        default: () => ({
            status: AccountStatus.TIDAK_ADA,
            tokens: []
        })
    }
})

siswaSchema.virtual('keterlambatan', {
    ref: 'lateness',
    localField: 'nis',
    foreignField: 'nis'
})

siswaSchema.methods.getDataSiswa = function (this: DocumentBaseDataSiswa) {
    const dataSiswaObject: SecureStudentData & { account: SecureStudentAccountData } & { _id: string } = {
        _id: this._id,
        nis: this.nis,
        namaLengkap: this.namaLengkap,
        kelas: this.kelas,
        kelasNo: this.kelasNo,
        kelasString: this.kelasString,
        jurusan: this.jurusan,
        fullClass: this.fullClass,
        hasAccount: this.hasAccount,
        account: {
            email: this.account.email,
            status: this.account.status
        }
    }

    return dataSiswaObject
}

siswaSchema.methods.wipeTokens = function (this: DocumentBaseDataSiswa) {
    this.account.tokens = []
}

siswaSchema.methods.wipeSuperToken = function (this: DocumentBaseDataSiswa) {
    this.account.superToken = ''
}

siswaSchema.methods.generateToken = async function (this: DocumentBaseDataSiswa) {
    const { token } = await createStudentJwt(this)
    if (_.isArray(this.account.tokens)) this.account.tokens.push({ token })
    else this.account.tokens = [{ token }]

    return token
}

siswaSchema.pre('save', async function (next) {
    if (this.isModified('kelas')) {
        this.kelasString = generateKelasString(this.kelas)
    }

    if (this.isModified('account.password')) {
        const hashed = await hash(this.account.password)
        this.account.password = hashed
    }

    if (this.isModified('account.tokens')) {
        while (this.account.tokens.length > 3) {
            this.account.tokens.shift()
        }
    }

    next()
})

const StudentModel = mongoose.model<DataSiswa, StudentModel>('student', siswaSchema)

export default StudentModel
