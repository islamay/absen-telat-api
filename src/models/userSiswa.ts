import mongoose, { Model, Document } from 'mongoose'
import { hash } from '../helpers/crypto'
import { createQrCodeDataURL } from '../helpers/createQr'
import { accountStatus } from '../helpers/accountEnum'
import validateUserSiswa from '../validation/userSiswa';
import { createMuridJWT as createSiswaJwt } from '../helpers/jwtManager';
import SiswaDataModel, { DataSiswa } from './dataSiswa';
import Api500Error from '../error/Api500Error';
import _ from 'lodash';
import Api400Error from '../error/Api400Error';
import Api404Error from '../error/Api404Error';
import { compare } from '../helpers/crypto';
import Api401Error from '../error/Api401Error';

export interface UserSiswa {
    nis: string;
    email: string;
    password: string;
    status: accountStatus;
    tokens: { token: string }[];
}



interface SiswaMethods {
    secureData(): Omit<UserSiswa, 'password' | 'tokens'>;
    getSiswaFullData(): Promise<DataSiswa>;
    changeStatus(status: accountStatus): Promise<void>
}

export type DocumentBaseUserSiswa = Document & UserSiswa & SiswaMethods;

interface UserSiswaModel extends Model<UserSiswa, {}, SiswaMethods> {
    createSiswaUserAndJwt(userSiswa: Omit<UserSiswa, 'status' | 'qrcode' | 'tokens'>): Promise<[DocumentBaseUserSiswa, string]>,
    findOneByEmail(email: string): Promise<DocumentBaseUserSiswa>,
    findOneByToken(token: string): Promise<DocumentBaseUserSiswa>,
    login(email: string, password: string): Promise<[DocumentBaseUserSiswa, string]>
}

const siswaSchema = new mongoose.Schema<UserSiswa, undefined, SiswaMethods>({
    nis: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 100,
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

siswaSchema.statics.createSiswaUserAndJwt = async function (this: UserSiswaModel, userSiswa: UserSiswa) {
    try {
        await validateUserSiswa(userSiswa)
        const userSiswaDocument = new this(userSiswa)
        const jwt = await createSiswaJwt(userSiswaDocument)

        userSiswaDocument.tokens.push({ token: jwt })
        await userSiswaDocument.save()

        return [userSiswaDocument, jwt]
    } catch (error) {
        throw error
    }
}

siswaSchema.statics.findOneByEmail = async function (this: UserSiswaModel, email: string) {
    try {
        const siswa = await this.findOne({ email: email })

        if (_.isNull(siswa) || _.isUndefined(siswa)) {
            throw new Api404Error('Email Tidak Ditemukan')
        }

        return siswa

    } catch (error) {
        throw error
    }
}

siswaSchema.statics.findOneByToken = async function (this: UserSiswaModel, token) {
    try {
        const userSiswaDocument = await this.findOne({ 'tokens.token': token })
        if (!userSiswaDocument) throw new Api401Error('Token Tidak Valid')
        return userSiswaDocument
    } catch (error) {
        throw error
    }
}

siswaSchema.statics.login = async function (this: UserSiswaModel, email: string, password: string) {
    try {
        const userSiswaDocument = await this.findOneByEmail(email)
        await compare(password, userSiswaDocument.password)

        const jwt = await createSiswaJwt(userSiswaDocument)
        userSiswaDocument.tokens.push({ token: jwt })
        await userSiswaDocument.save()

        return [userSiswaDocument, jwt]

    } catch (error) {
        throw error
    }
}

siswaSchema.methods.secureData = function (this: UserSiswa) {
    const { nis, email, status } = this
    return { nis, email, status }
}

siswaSchema.methods.getSiswaFullData = async function (this: UserSiswa) {
    const { nis } = this

    try {
        const siswaDataDocument = await SiswaDataModel.findOne({ nis: nis })
        if (_.isNull(siswaDataDocument) || _.isUndefined(siswaDataDocument)) {
            throw new Api400Error('NIS Invalid', 'Data Siswa Tidak Ditemukan')
        }

        const dataSiswa = siswaDataDocument.getDataSiswa()
        return dataSiswa
    } catch (error) {
        throw error
    }
}

siswaSchema.methods.changeStatus = async function (this: DocumentBaseUserSiswa, status) {
    try {
        this.status = status
        await this.save()
    } catch (error) {
        throw error
    }
}

siswaSchema.post('validate', async function (): Promise<void> {
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

siswaSchema.virtual('siswa', {
    ref: 'siswa',
    foreignField: 'nis',
    localField: 'nis',
    justOne: true
})

siswaSchema.pre('save', function () {
    this.isModified()
})

const UserSiswaModel = mongoose.model<UserSiswa, UserSiswaModel>('siswaUser', siswaSchema, 'siswa_user')
export default UserSiswaModel

