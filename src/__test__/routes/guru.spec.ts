
import supertest from 'supertest'
import app from '../../index'
import db, { DefaultData } from '../config/db'
import { loginTests } from './guru'

const request = supertest(app)
let defaultData: DefaultData

beforeAll(async () => {
    await db.connect()
    const { adminToken } = await db.addDefaultData()
    defaultData = { adminToken }
})

afterAll(async () => {
    await db.close()
})



describe('Route Guru', () => {

    describe('POST /guru/signin', () => {
        loginTests.forEach((loginData) => {
            test(loginData.testName, async () => {
                const res = await request.post('/guru/signin')
                    .send(loginData.body)

                expect(res.statusCode).toEqual(loginData.statusCode)
            })
        })
    })

})
