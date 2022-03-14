import _ from 'lodash'

const isAnyNull = (array: Array<any>) => {

    if (_.isEmpty(array)) {
        return false
    }

    let arrayHasNullValue = false
    let errorInIndex: number = -1;
    for (let i = 0; i < array.length; i++) {
        const value = array[i]
        if (_.isNull(value) || _.isUndefined(value)) {
            arrayHasNullValue = true
            errorInIndex = i
            break
        }
    }

    return arrayHasNullValue
}

export default isAnyNull