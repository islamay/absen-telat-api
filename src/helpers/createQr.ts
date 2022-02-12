import QRCode from 'qrcode'

export const createQrCodeDataURL = async (object: object) => {
    const jsonPayload = JSON.stringify(object)
    try {
        const dataUrl = await QRCode.toDataURL(jsonPayload)
        return dataUrl
    } catch (error) {
        console.log(error);
        return null
    }
}

