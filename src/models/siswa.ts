import mongoose, { Model } from 'mongoose'
import { hash } from '../helpers/crypto'
import { createQrCodeDataURL } from '../helpers/createQr'

export interface Siswa {
    nis: string;
    namaLengkap: string;
    kelas: number;
    jurusan: string;
    email: string;
    password: string;
    qrcode: string;
}

interface SiswaMethods {
    secureData(): Omit<Siswa, 'password'>;
}

interface SiswaModel extends Model<Siswa, {}, SiswaMethods> { }

const siswaSchema = new mongoose.Schema<Siswa, undefined, SiswaMethods>({
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
    qrcode: {
        type: String,
        required: true
    }
})

siswaSchema.methods.secureData = function (this: Siswa) {
    const { nis, namaLengkap, kelas, jurusan, qrcode, email } = this
    return { nis, namaLengkap, kelas, jurusan, qrcode, email }
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

const SiswaModel = mongoose.model<Siswa, SiswaModel>('siswa', siswaSchema, 'siswa')
export default SiswaModel