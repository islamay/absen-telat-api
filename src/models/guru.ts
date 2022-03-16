import { model, Schema, Document, Model } from 'mongoose'
import { hash } from '../helpers/crypto'
import { accountStatus } from '../helpers/accountEnum';
import validateGuru from '../validation/guru';
import { createGuruJWT } from '../helpers/jwtManager';

export enum guruRole {
    STANDAR = 'STANDAR',
    ADMIN = 'ADMIN'
}

export interface IGuru {
    namaLengkap: string;
    email: string;
    password: string;
    status: string;
    role: guruRole
}

export type IGuruAsParam = Omit<IGuru, 'status' | 'role'>

export enum KnownError {
    NotFound = 'Email Tidak Ditemukan'
}

export interface IGuruMethods {
    secureData: () => Omit<IGuru, 'password'>
}

export type DocumentBaseIGuru = Document & IGuru & IGuruMethods

export interface IGuruModel extends Model<IGuru, {}, IGuruMethods> {
    findByEmail(email: string): DocumentBaseIGuru;
    createGuruAndJwt(guru: IGuruAsParam): Promise<[DocumentBaseIGuru, string]>;
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
    }
})

guruSchema.statics.createGuruAndJwt = async function (this: IGuruModel, guru: IGuruAsParam): Promise<[DocumentBaseIGuru, string]> {
    const { namaLengkap, email, password } = guru
    try {
        await validateGuru({ namaLengkap, email, password })
        const guruDocument = new this({ namaLengkap, email, password })
        console.log(guruDocument._id);

        const savingDocument = guruDocument.save()
        const createGuruJwtTask = createGuruJWT(guruDocument._id.toString())
        const promisesResult = await Promise.all([savingDocument, createGuruJwtTask])
        const jwt = promisesResult[1]

        return [guruDocument, jwt]
    } catch (error) {

    }
}

guruSchema.statics.findByEmail = async function (email) {
    const guru = await GuruModel.findOne({ email: email })
    if (!guru) throw new Error(KnownError.NotFound)
    return guru
}

guruSchema.methods.secureData = function (this: IGuru) {
    const { email, namaLengkap, role, status } = this
    return { email, namaLengkap, role, status }
}

guruSchema.post('validate', async function () {
    try {
        const plainPassword = this.password
        const hashedPassword = await hash(plainPassword)
        this.password = hashedPassword

    } catch (error) {
        console.log(error);
    }
})


const GuruModel = model<IGuru, IGuruModel>('guru', guruSchema, 'guru')
export default GuruModel