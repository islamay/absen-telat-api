import mongoose, { Model, Document } from 'mongoose'
import { hash } from '../helpers/crypto'
import { createQrCodeDataURL } from '../helpers/createQr'
import { accountStatus } from '../helpers/accountEnum'
import validateUserSiswa from '../validation/userSiswa';
import { createMuridJWT as createSiswaJwt } from '../helpers/jwtManager';

export interface UserSiswa {
    nis: string;
    email: string;
    password: string;
    status: string;
    qrcode: string;
}

interface SiswaMethods {
    secureData(): Omit<UserSiswa, 'password'>;
}

export type DocumentBaseISiswa = Document & UserSiswa & SiswaMethods;

interface UserSiswaModel extends Model<UserSiswa, {}, SiswaMethods> {
    createSiswaUserAndJwt(userSiswa: Omit<UserSiswa, 'status' | 'qrcode'>): Promise<[DocumentBaseISiswa, string]>,
    findOneByEmail(email: string): Promise<DocumentBaseISiswa | null>
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
    qrcode: {
        type: String,
        required: true
    }
})

siswaSchema.statics.createSiswaUserAndJwt = async function (this: UserSiswaModel, userSiswa: UserSiswa) {
    try {
        await validateUserSiswa(userSiswa)
        const userSiswaDocument = new this(userSiswa)
        const savingDocument = userSiswaDocument.save()
        const createSiswaJwtTask = createSiswaJwt(userSiswaDocument.nis)

        const promises = await Promise.all([savingDocument, createSiswaJwtTask])
        const jwt = promises[1]

        return [userSiswaDocument, jwt]
    } catch (error) {
        throw error
    }
}

siswaSchema.statics.findOneByEmail = async function (this: UserSiswaModel, email: string) {
    try {
        const siswa = await this.findOne({ email: email })

        return siswa
    } catch (error) {
        console.log(error);
        return null
    }
}

siswaSchema.methods.secureData = function (this: UserSiswa) {
    const { nis, qrcode, email, status } = this
    return { nis, qrcode, email, status }
}

siswaSchema.pre('validate', async function (next): Promise<void> {
    const { nis, email } = this
    const payload = { nis, email }
    const qrDataUrl = await createQrCodeDataURL(payload)

    this.qrcode = qrDataUrl
    next()
})

siswaSchema.post('validate', async function (): Promise<void> {
    const { password } = this
    const hashedPassword = await hash(password)
    this.password = hashedPassword
})

const UserSiswaModel = mongoose.model<UserSiswa, UserSiswaModel>('siswaUser', siswaSchema, 'siswa_user')
export default UserSiswaModel

