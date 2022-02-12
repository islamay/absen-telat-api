
interface anyEnum {
    [key: number]: string
}

const isKnownError = (errorMessage: string, errorEnum: anyEnum) => {
    if (Object.values(errorEnum).includes(errorMessage)) return true
    else return false
}

export default isKnownError