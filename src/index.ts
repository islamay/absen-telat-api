import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { exit } from 'process'
import createConnection from './helpers/db'
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


const port = 5000
const main = async () => {
    try {

        const connection = await createConnection(process.env.DB_URI)
        console.log('Success Connecting To \'Main\' Database 1/1');


        app.listen(port, () => console.log(`Running on port ${port} | http://localhost:${port}`))
    } catch (error) {
        console.log(error);
        console.log(error.message);
        exit()
    }
}

main()