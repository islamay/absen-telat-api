import request from '../../request'

const payloads = [
    { headers: '' }
]

describe('GET /guru', () => {
    it('Will fail with 401 Status Code', () => {
        request
            .get('/guru')
            .then(response => {
                expect(response.statusCode).toBe(401)
            })
    })
})