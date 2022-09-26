const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
require('dotenv').config()


let mailTransporter = nodemailer.createTransport({                              //the mail transporter is what's responsible for sending mail.
    host: 'mail.privateemail.com',
    port: 465,
    auth:{
        user:`${process.env.ADMIN_EMAIL}`,
        pass:`${process.env.USER_PASS}`
    }
}) 

mailTransporter.use('compile', hbs({
    viewEngine: {
        extName: ".handlebars",
        partialsDir: path.resolve(__dirname, '..','public/views'),
        defaultLayout: false,
      }, 
    viewPath: path.resolve(__dirname, '..','public/views'),
    extName: ".handlebars"
}))

const _sendMail= async(email, username)=>{
    let details ={
        from: `${process.env.ADMIN_EMAIL}`,
        to:email,
        subject:'BEI YA JIONI: CONFIRM EMAIL ADDRESS',
        text:`Click the following link to confirm that your email account is real: ${process.env.HEROKU_SERVER_LINK}verify/${email}`,
        template: 'confirmEmail',
        context:{
            userEmail: email, // replace {{userName}} with provided email
            userName: username
        }
    }
    mailTransporter.sendMail(details, (err)=>{
        if(err) return console.log('nodemailer failed with the following error:', err.message, err)
        console.log('email has been sent')
    })
}


// _sendMail('leonofaugust@gmail.com', 'Santi')
module.exports = _sendMail




