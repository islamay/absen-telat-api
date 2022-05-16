import 'dotenv/config'
import nodemailer from 'nodemailer'



const transport = nodemailer.createTransport({
    host: 'snipbisa.com',
    port: 465,
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

export const sendPasswordResetRequestEmail = (to: string, link: string) => {

    sendMail(to, 'Permintaan reset password',
        `halo, <b>${to}</b> <p>berikut adalah link untuk mereset password anda <a href="${link}" target="_blank">${link}</a></p>`
    )
}
