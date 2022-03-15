export const generalValidationError = 'Data Tidak Lengkap'

enum LimitType {
    max = 'MAX',
    min = 'MIN'
}

const baseValiationError = (path: string, base: string) => {
    return `${path} Harus Berupa ${base}`
}

export const stringBase = (path: string) => {
    return baseValiationError(path, 'Huruf')
}

export const stringEmail = (path: string) => {
    return `${path} Harus Berupa Valid Email`
}

export const stringMin = (path: string, min: number) => {
    return `${path} Tidak Boleh Kurang Dari ${min} Huruf`
}

export const stringMax = (path: string, max: number) => {
    return `${path} Tidak Boleh Lebih Dari ${max} Huruf`
}

export const emptyValidationError = (path: string) => {
    return `${path} Harus Diisi`
}

export const requiredValidationError = (path: string) => {
    return `${path} Tidak Boleh Kosong`
}

export const numberBase = (path: string) => {
    return baseValiationError(path, 'Angka')
}

export const numberInteger = (path: string) => {
    return `${path} Harus Merupakan Bilangan Bulat`
}



const numberLimit = (path: string, limitType: LimitType, limit: number) => {
    const limitString = limitType === LimitType.max ? 'Lebih Besar' : 'Lebih Kecil'
    return `${path} Tidak Boleh ${limitString} Dari ${limit}`
}

export const numberMax = (path: string, max: number) => {
    return numberLimit(path, LimitType.max, max)
}

export const numberMin = (path: string, min: number) => {
    return numberLimit(path, LimitType.min, min)
}

export const anyOnly = (path: string) => {
    return `${path} Tidak Valid`
}

export const duplicateKeyErrorMessage = (path: string) => {
    return `${path} Sudah Dipakai`
}