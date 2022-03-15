
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

    getFormattedError(): any {
        const errorNameAndDescriptionObject = {
            name: this.name,
            message: this.message
        }

        return errorNameAndDescriptionObject
    }
}


export default BaseError