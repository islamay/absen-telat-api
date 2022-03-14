import mongoose, { Model, Document } from 'mongoose'
import { hash } from '../helpers/crypto'
import { createQrCodeDataURL } from '../helpers/createQr'
import { accountStatus } from '../helpers/accountEnum'

export interface UserSiswa {
    nis: string;
    namaLengkap: string;
    kelas: number;
    jurusan: string;
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
    findOneByEmail(email: string): Promise<DocumentBaseISiswa | null>
}

const siswaSchema = new mongoose.Schema<UserSiswa, undefined, SiswaMethods>({
    nis: {
        type: String,
        unique: true,
        required: true,
    },
    namaLengkap: {
        type: String,
        required: true
    },
    kelas: {
        type: Number,
        required: true
    },
    jurusan: {
        type: String,
        required: true
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
    const { nis, namaLengkap, kelas, jurusan, qrcode, email, status } = this
    return { nis, namaLengkap, kelas, jurusan, qrcode, email, status }
}

siswaSchema.pre('validate', async function (next): Promise<void> {
    const { nis, namaLengkap, kelas, jurusan, email } = this
    const payload = { nis, namaLengkap, kelas, jurusan, email }
    const qrDataUrl = await createQrCodeDataURL(payload)

    this.qrcode = qrDataUrl
    next()
})

siswaSchema.post('validate', async function (): Promise<void> {
    const { password } = this
    const hashedPassword = await hash(password)
    this.password = hashedPassword
})

const UserSiswaModel = mongoose.model<UserSiswa, UserSiswaModel>('siswaUser', siswaSchema, 'siswa')
export default UserSiswaModel

