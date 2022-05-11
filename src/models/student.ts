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

type CreateStudent = Omit<DataSiswa, 'kelasString' | 'fullClass' | 'hasAccount' | 'account'>

type SecureStudentData = Omit<DataSiswa, 'account'> & { account: SecureStudentAccountData }

type SecureStudentAccountData = Omit<StudentAccount, 'password' | 'tokens' | 'superToken'>


export interface DataSiswaMethods {
    getFullClass: () => string,
    getDataSiswa: () => Omit<DataSiswa, 'account'> & {
        account: Omit<StudentAccount, 'password' | 'tokens' | 'superToken'>
    },
    generateToken: () => Promise<string>,
    wipeTokens: () => void
}

export type DocumentBaseDataSiswa = Document & DataSiswa & DataSiswaMethods;

export interface SiswaModel extends Model<DataSiswa, {}, DataSiswaMethods> {
    createSiswa: (siswa: CreateStudent) => Promise<DocumentBaseDataSiswa>,
    findByNis: (nis: string) => Promise<DocumentBaseDataSiswa>
    findSiswaByName: (name: string) => Promise<DocumentBaseDataSiswa[]>,
    findByEmail: (email: string) => Promise<DocumentBaseDataSiswa>,
    signIn: (email: string, password: string) => Promise<{ siswa: SecureStudentData, token: string }>,
    signUp: (nis: string, email: string, password: string) => Promise<{ token: string }>
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


siswaSchema.statics.findByEmail = async function (this: SiswaModel, email: string) {
    try {
        const student = await this.findOne({ 'account.email': email })
        if (!student) throw new Api404Error('Email tidak ditemukan')

        return student
    } catch (error) {
        throw error
    }
}

siswaSchema.statics.signUp = async function (this: SiswaModel, nis: string, email: string, password: string) {
    const siswa = await this.findOne({ nis: nis })
    const { account } = siswa
    if (!siswa) throw new Api404Error('Nis siswa tidak ditemukan')
    if (account && account.email && account.status !== AccountStatus.TIDAK_ADA) throw new Api401Error('Siswa ini telah memiliki akun')

    siswa.account.status = AccountStatus.MENUNGGU

    siswa.account.email = email
    siswa.account.password = password


    await siswa.save()
}

siswaSchema.statics.signIn = async function (this: SiswaModel, email: string, password: string) {
    const student = await this.findOne({ 'account.email': email })
    if (!student) throw new Api404Error('Email tidak ditemukan')

    const isValidated = await compare(password, student.account.password)
    if (!isValidated) throw new Api401Error('Password salah')

    if (student.account.status === 'MENUNGGU') throw new Api401Error('Akun belum aktif, harap hubungi admin')
    else if (student.account.status === 'NONAKTIF') throw new Api401Error('Akun tidak aktif')


    const token = await student.generateToken()
    await student.save()

    return { siswa: student.getDataSiswa(), token }
}

siswaSchema.statics.findByNis = async function (this: SiswaModel, nis: string) {
    try {
        const student = await this.findOne({ nis })
        if (!student) throw new Api404Error('Siswa tidak ditemukan')

        return student
    } catch (error) {
        throw error
    }
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

    if (this.account && this.account.tokens && this.account.tokens.length > 3) {
        this.account.tokens.splice(0, 1)
    }

    next()
})

const SiswaModel = mongoose.model<DataSiswa, SiswaModel>('student', siswaSchema)

export default SiswaModel
