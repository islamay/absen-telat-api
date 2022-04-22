import { compare } from 'bcrypt';
import mongoose, { Document, Model } from 'mongoose'
import { createMuridJWT } from '../helpers/jwtManager';
import Api401Error from '../error/Api401Error';
import Api404Error from '../error/Api404Error';
import enumValues from '../helpers/enumValues'
import studentAccountSchema, { StudentAccount } from './userSiswa';
import { hash } from '../helpers/crypto';

export enum Kelas {
    X = 10,
    XI = 11,
    XII = 12
}

export enum kelasString {
    X = 'X',
    XI = 'XI',
    XII = 'XII'
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

type CreateStudent = Omit<DataSiswa, 'kelasString' | 'fullClass' | 'hasAccount' | 'account'>

type SecureStudentData = Omit<DataSiswa, 'account'> & { account: SecureStudentAccountData }

type SecureStudentAccountData = Omit<StudentAccount, 'password' | 'tokens' | 'superToken'>


export interface DataSiswaMethods {
    getFullClass: () => string,
    getDataSiswa: () => Omit<DataSiswa, 'account'> & {
        account: Omit<StudentAccount, 'password' | 'tokens' | 'superToken'>
    }
}

export type DocumentBaseDataSiswa = Document & DataSiswa & DataSiswaMethods;

export interface SiswaModel extends Model<DataSiswa, {}, DataSiswaMethods> {
    createSiswa: (siswa: CreateStudent) => Promise<DocumentBaseDataSiswa>,
    findSiswaByNis: (nis: string) => Promise<DocumentBaseDataSiswa>
    findSiswaByName: (name: string) => Promise<DocumentBaseDataSiswa[]>
}

const generateKelasString = function (kelas: Kelas) {
    switch (kelas) {
        case Kelas.X:
            return kelasString.X
        case Kelas.XI:
            return kelasString.XI
        case Kelas.XII:
            return kelasString.XII
    }
}


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
    account: studentAccountSchema
})

siswaSchema.virtual('keterlambatan', {
    ref: 'keterlambatan',
    localField: 'nis',
    foreignField: 'nis'
})

siswaSchema.statics.createSiswa = async function (this: SiswaModel, siswa: Omit<DataSiswa, 'kelasString' | 'fullClass'>) {
    const { nis, namaLengkap, kelas, kelasNo, jurusan } = siswa || null

    try {
        const siswaDocument = new this({ nis, namaLengkap, kelas, kelasNo, jurusan })
        await siswaDocument.save()
        return siswaDocument
    } catch (err) {
        throw err
    }
}

siswaSchema.statics.signUp = async function (this: SiswaModel, nis: string, email: string, password: string) {
    const siswa = await this.findOne({ nis: nis })
    if (!siswa) throw new Api404Error('Nis siswa tidak ditemukan')
    if (siswa.account.email) throw new Api401Error('Siswa ini telah memiliki akun')

    siswa.account.email = email
}

siswaSchema.statics.signIn = async function (this: SiswaModel, email: string, password: string) {
    const account = await this.findOne({ 'account.email': email })
    if (!account) throw new Api404Error('Email tidak ditemukan')

    const isValidated = await compare(password, account.account.password)
    if (!isValidated) throw new Api401Error('Password salah')

    const token = await createMuridJWT(account)

    const result = account.getDataSiswa()

}

siswaSchema.statics.findSiswaByName = async function (this: SiswaModel, name: string) {
    try {
        const siswaDocuments = await this.find({ namaLengkap: { $regex: name, $options: 'i' } })
        return siswaDocuments
    } catch (error) {
        throw error
    }
}

siswaSchema.methods.getFullClass = function (this: DataSiswa) {
    if (this.kelasNo === 1) {
        const fullClass = `${this.kelasString} ${this.jurusan}`
        return fullClass
    } else {
        const fullClass = `${this.kelasString} ${this.jurusan} ${this.kelasNo}`
        return fullClass
    }
}

siswaSchema.methods.getDataSiswa = function (this: DocumentBaseDataSiswa) {
    const dataSiswaObject: SecureStudentData & { account: SecureStudentAccountData } = {
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

siswaSchema.pre('save', async function (next) {
    if (this.isModified('kelas')) {
        this.kelasString = generateKelasString(this.kelas)
    }

    if (this.isModified('account.password')) {
        const hashed = await hash(this.account.password)
        this.account.password = hashed
    }

    if (this.account && this.account.tokens.length > 3) {
        const tokens = this.account.tokens.splice(0, 1)
        this.account.tokens = tokens
    }

    next()
})

const SiswaModel = mongoose.model<DataSiswa, SiswaModel>('siswa', siswaSchema, 'siswa_data')

export default SiswaModel
