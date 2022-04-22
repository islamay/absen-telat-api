import 'dotenv/config'
import nodemailer from 'nodemailer'



const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

export const sendMail = (to: string, subject: string, html: string) => {

    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.MAIL,
        to,
        subject,
        html
    }

    return transport.sendMail(mailOptions)
}
