import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import createGuruRoutes from './routes/guru'
import createTerlambatRoutes from './routes/terlambat'
import errorHandlerMiddleware from './error/errorHandler'
import createStudentRoute from './routes/siswa'
import notFound from './middlewares/notFound'
import path from 'path'
const app = express()

app.disable('etag')
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/guru', createGuruRoutes())
app.use('/keterlambatan', createTerlambatRoutes())
app.use('/siswa', createStudentRoute())
app.use(notFound())
app.use(errorHandlerMiddleware())


export default app