import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { exit } from 'process'
import createGuruRoutes from './routes/guru'
import createUserSiswaRoutes from './routes/userSiswa'
import createDataSiswaRoutes from './routes/dataSiswa'
import createTerlambatRoutes from './routes/terlambat'
import errorHandlerMiddleware from './error/errorHandler'
const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use('/guru', createGuruRoutes())
app.use('/user-siswa', createUserSiswaRoutes())
app.use('/data-siswa', createDataSiswaRoutes())
app.use('/keterlambatan', createTerlambatRoutes())
app.use(errorHandlerMiddleware())


export default app