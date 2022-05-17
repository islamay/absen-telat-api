import app from '../src/index'
import supertest from 'supertest'

const request = supertest(app)
export default request