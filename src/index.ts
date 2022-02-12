import 'dotenv/config'
import express from 'express'
import { exit } from 'process'
import createConnection from './helpers/db'
import createGuruRoutes from './routes/guru'
import createSiswaRoutes from './routes/siswa'
import createTerlambatRoutes from './routes/terlambat'

const app = express()

app.use(express.json())
app.use('/guru', createGuruRoutes())
app.use('/siswa', createSiswaRoutes())
app.use('/terlambat', createTerlambatRoutes())

const port = 5000
const main = async () => {
    try {
        const connection = await createConnection(process.env.DB_URI)
        console.log('Success Connecting To \'Main\' Database 1/1');


        app.listen(port, () => console.log(`Running on port ${port} | http://localhost:${port}`))
    } catch (error) {
        console.log(error.message);
        exit()
    }
}

main()