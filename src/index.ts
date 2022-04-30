import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import createGuruRoutes from './routes/guru'
import createTerlambatRoutes from './routes/terlambat'
import errorHandlerMiddleware from './error/errorHandler'
import createStudentRoute from './routes/siswa'
import notFound from './middlewares/notFound'
const app = express()

app.disable('etag')
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use('/guru', createGuruRoutes())
app.use('/keterlambatan', createTerlambatRoutes())
app.use('/siswa', createStudentRoute())
app.use(notFound())
app.use(errorHandlerMiddleware())


export default app