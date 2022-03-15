import Joi from 'joi'


const validationErrorFormatter = (error: Joi.ValidationError) => {
    return error.details.map(errorDetail => {
        return { [errorDetail.path[0]]: errorDetail.message }
    })
}

export default validationErrorFormatter