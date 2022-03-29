import app from '../../index'
import supertest from 'supertest'
import db from '../config/db'

const request = supertest(app)

beforeAll(async () => {
    await db.connect()
})

afterAll(async () => {
    await db.close()
})

describe('dump', () => {
    test('dump test', () => {
        expect(true).toBeTruthy()
    })
})