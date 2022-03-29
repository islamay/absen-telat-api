import app from './index'
import mongoose from 'mongoose'

const port = 5000
const main = async () => {
    try {
        if (process.env.NODE_ENV !== 'test') {
            const connection = await mongoose.connect(process.env.DB_URI)
        }
        console.log('Success Connecting To \'Main\' Database 1/1');
        app.listen(port, () => console.log(`Running on port ${port} | http://localhost:${port}`))
    } catch (error) {
        console.log(error);
        console.log(error.message);
    }
}

main()