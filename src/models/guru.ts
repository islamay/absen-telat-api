import { model, Schema } from 'mongoose'
import { hash } from '../helpers/crypto'

export interface IGuru {
    namaLengkap: string;
    email: string;
    password: string;
    telepon: string;
}

const guruSchema = new Schema<IGuru, {}, {}>({
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
    telepon: {
        type: String,
        unique: false,
        required: true
    }
})

guruSchema.post('validate', async function () {
    try {
        const plainPassword = this.password
        const hashedPassword = await hash(plainPassword)
        this.password = hashedPassword

    } catch (error) {
        console.log(error);
    }
})

const GuruModel = model<IGuru>('guru', guruSchema, 'guru')
export default GuruModel