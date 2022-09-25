const nodemailer = require('nodemailer')
require('dotenv').config()

let mailTransporter = nodemailer.createTransport({                              //the mail transporter is what's responsible for sending mail.
    host: 'mail.privateemail.com',
    port: 465,
    auth:{
        user:`${process.env.ADMIN_EMAIL}`,
        pass:`${process.env.USER_PASS}`
    }
}) 

const _sendMail=(email)=>{
    let details ={
        from: `${process.env.ADMIN_EMAIL}`,
        to:email,
        subject:'BEI YA JIONI: CONFIRM EMAIL ADDRESS',
        text:`Click the following link to confirm that your email account is real: http://localhost:3005/verify/${email}`
    }
    mailTransporter.sendMail(details, (err)=>{
        if(err) return console.log('nodemailer failed with the following error:', err.message)
        console.log('email has been sent')
    })
}

module.exports = _sendMail




