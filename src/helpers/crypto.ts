import 'dotenv/config'
import bcrypt from 'bcrypt'

export const hash = async (data: string) => {
    try {
        const hashed = await bcrypt.hash(data, 8)
        return hashed
    } catch (error) {
        console.log(error);
        return null
    }
}

export const compare = async (plain: string, hashed: string) => {
    const isMatched = bcrypt.compare(plain, hashed)
    return isMatched
}