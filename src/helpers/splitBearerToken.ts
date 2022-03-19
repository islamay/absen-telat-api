import _ from 'lodash'
import Api401Error from '../error/Api401Error'

const splitBearerToken = (bearerToken: string) => {
    if (_.isNull(bearerToken) || _.isUndefined(bearerToken)) throw new Api401Error('Token Must Be Provided')
    const token = bearerToken.split(' ')[1]
    return token
}

export default splitBearerToken
