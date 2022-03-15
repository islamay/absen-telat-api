import _ from 'lodash'
import mongoose from 'mongoose'
import { duplicateKeyErrorMessage } from './ValidationErrorMessage'

interface PathParam {
    path: string,
    payload: string
}

const validateUniqueness = async (path: PathParam | PathParam[], Model: mongoose.Model<any>) => {

    if (!_.isArray(path)) {
        const checkUniqueness = await Model.findOne({ [path.path]: path.payload })
        if (_.isNull(checkUniqueness) || _.isUndefined(checkUniqueness)) {
            return false
        } else {
            return { [path.path]: duplicateKeyErrorMessage(path.path) }
        }
    } else {
        const order = path.map(pathAndMap => pathAndMap.path)

        const checkAllUniqueness = path.map(pathAndPayload => {
            const checkUniqueness = Model.findOne({ [pathAndPayload.path]: pathAndPayload.payload })
            return checkUniqueness
        })

        const results = await Promise.all(checkAllUniqueness)
        const errors = results.map((result, index) => {

            if (_.isNull(result) || _.isUndefined(result)) {
                return null
            } else {
                return { [order[index]]: duplicateKeyErrorMessage(order[index]) }
            }
        }).filter(error => !_.isNull(error))

        if (_.isEmpty(errors)) {
            return false
        }

        return errors
    }

}

export default validateUniqueness