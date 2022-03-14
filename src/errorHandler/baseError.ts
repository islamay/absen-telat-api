
class BaseError extends Error {
    name: string
    statusCode: number
    isOperational: boolean

    constructor(name: string, statusCode: number, isOperational: boolean, description: string) {
        super(description)

        Object.setPrototypeOf(this, new.target.prototype)
        this.name = name
        this.statusCode = statusCode
        this.isOperational = isOperational
        Error.captureStackTrace(this)
    }

    getErrorNameAndDescriptionObject() {
        const errorNameAndDescriptionObject = {
            errorName: this.name,
            errorMessage: this.message
        }

        return errorNameAndDescriptionObject
    }
}


export default BaseError