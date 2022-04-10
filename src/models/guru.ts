import { model, Schema, Document, Model } from 'mongoose'
import { hash } from '../helpers/crypto'
import { accountStatus } from '../helpers/accountEnum';
import validateGuru from '../validation/guru';
import { createGuruJWT } from '../helpers/jwtManager';
import { compare } from '../helpers/crypto'
import Api404Error from '../error/Api404Error';
import Api401Error from '../error/Api401Error';
import _ from 'lodash';

export enum guruRole {
    STANDAR = 'STANDAR',
    ADMIN = 'ADMIN'
}

export interface IGuru {
    namaLengkap: string;
    email: string;
    password: string;
    status: accountStatus;
    role: guruRole,
    tokens: { token: string }[]
}

export type IGuruAsParam = Omit<IGuru, 'status' | 'role' | 'tokens'>

export enum KnownError {
    NotFound = 'Email Tidak Ditemukan'
}

export interface IGuruMethods {
    secureData: () => Omit<IGuru, 'password' | 'tokens'>,
    generateJwt: () => Promise<string>,
    removeToken(token: string): Promise<void>;
    changeStatus: (status: accountStatus) => Promise<void>
}

export type DocumentBaseIGuru = Document & IGuru & IGuruMethods

export interface IGuruModel extends Model<IGuru, {}, IGuruMethods> {
    findByEmail(email: string): DocumentBaseIGuru;
    createGuru(guru: IGuruAsParam): Promise<DocumentBaseIGuru>
    createGuruAndJwt(guru: IGuruAsParam): Promise<[DocumentBaseIGuru, string]>;
    login(email: string, password: string): Promise<[DocumentBaseIGuru, string]>;
    findOneByToken(token: string): Promise<DocumentBaseIGuru>;
}


const guruSchema = new Schema<IGuru, {}, IGuruMethods>({
    namaLengkap: {
        type: String,
        unique: false,
        required: true

    },
    email: {
        type: String,
        unique: false,
        required: true
    },
    password: {
        type: String,
        unique: false,
        required: true,
        min: 8,
        max: 100
    },
    role: {
        type: String,
        enum: [guruRole.STANDAR, guruRole.ADMIN],
        default: guruRole.STANDAR
    },
    status: {
        type: String,
        enum: [accountStatus.AKTIF, accountStatus.MENUNGGU],
        default: accountStatus.MENUNGGU
    },
    tokens: [{
        token: {
            type: String
        }
    }]
})

guruSchema.statics.createGuru = async function (this: IGuruModel, guru: IGuruAsParam): Promise<DocumentBaseIGuru> {
    try {
        const { namaLengkap, email, password } = guru
        const guruDocument = new this({ namaLengkap, email, password })
        await guruDocument.save()
        return guruDocument

    } catch (error) {
        throw error
    }
}

guruSchema.statics.createGuruAndJwt = async function (this: IGuruModel, guru: IGuruAsParam): Promise<[DocumentBaseIGuru, string]> {
    const { namaLengkap, email, password } = guru
    try {
        await validateGuru({ namaLengkap, email, password })
        const guruDocument = new this({ namaLengkap, email, password })

        const savingDocument = guruDocument.save()
        const createGuruJwtTask = createGuruJWT(guruDocument)
        const promisesResult = await Promise.all([savingDocument, createGuruJwtTask])
        const jwt = promisesResult[1]

        return [guruDocument, jwt]
    } catch (error) {
        throw error
    }
}

guruSchema.statics.findByEmail = async function (email) {
    try {
        const guru = await GuruModel.findOne({ email: email })
        if (!guru) throw new Api404Error('Email Tidak Ditemukan')
        return guru
    } catch (error) {
        throw error
    }
}

guruSchema.statics.findOneByToken = async function (token: string) {
    try {
        const guruDocument = await GuruModel.findOne({ 'tokens.token': token })
        if (!guruDocument) throw new Api401Error('Token Tidak Valid')

        return guruDocument
    } catch (error) {
        throw error
    }
}

guruSchema.statics.login = async function (this: IGuruModel, email: string, password: string) {
    try {
        const guruDocument = await this.findByEmail(email)
        const { password: realPassword } = guruDocument

        await compare(password, realPassword)

        const jwt = await guruDocument.generateJwt()
        return [guruDocument, jwt]

    } catch (error) {
        throw error
    }
}

guruSchema.methods.changeStatus = async function (this: DocumentBaseIGuru, status) {
    try {
        this.status = status
        await this.save()
    } catch (error) {
        throw error
    }
}

guruSchema.methods.generateJwt = async function (this: DocumentBaseIGuru) {
    try {
        const jwt = await createGuruJWT(this)

        this.tokens.push({ token: jwt })
        await this.save()

        return jwt
    } catch (error) {
        throw error
    }
}

guruSchema.methods.removeToken = async function (this: DocumentBaseIGuru, givenToken) {
    const tokens = this.tokens.filter(token => {
        return token.token !== givenToken
    })

    try {
        this.tokens = tokens
        await this.save()
    } catch (error) {
        throw error
    }
}

guruSchema.methods.secureData = function (this: DocumentBaseIGuru) {
    const { email, namaLengkap, role, status, _id } = this
    return { email, namaLengkap, role, status, _id }
}

guruSchema.post('validate', async function () {
    if (this.isNew || this.isModified('password')) {
        try {
            const { password } = this
            const hashedPassword = await hash(password)
            this.password = hashedPassword
        } catch (error) {
            throw error
        }
    }

})


const GuruModel = model<IGuru, IGuruModel>('guru', guruSchema, 'guru')
export default GuruModel