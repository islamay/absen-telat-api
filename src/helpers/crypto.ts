import 'dotenv/config'
import bcrypt from 'bcrypt'
import Api401Error from '../error/Api401Error'

export const hash = async (data: string) => {
    try {
        const hashed = await bcrypt.hash(data, 8)
        return hashed
    } catch (error) {
        return null
    }
}

export const compare = async (plain: string, hashed: string) => {
    const isMatched = await bcrypt.compare(plain, hashed)
    if (!isMatched) {
        throw new Api401Error('Password Salah')
    }
}