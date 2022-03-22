import { Types } from 'mongoose'
import QRCode from 'qrcode'

interface Payload {
    id: Types.ObjectId
}

export const createQrCodeDataURL = async (object: Payload) => {
    const jsonPayload = JSON.stringify(object)
    try {
        const dataUrl = await QRCode.toDataURL(jsonPayload)
        return dataUrl
    } catch (error) {
        console.log(error);
        return null
    }
}

