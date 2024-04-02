const nodemailer = require('nodemailer');


const sendEmail = async(req,res) => {
 
     const {name,email,phone,message} = req.body;

     contentHTML = `
           <h1>User Information</h1>
           <ul>
           <li>Username: ${name}</li>
           <li>User Email ${email}</li>
           </ul>
           <p>${message}</p>       
      
     `

     res.send("Email Ok");

     let transporter = nodemailer.createTransport(
        {
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
            user: 'giamteam420@hotmail.com',
            pass: 'Giam420123'
        }
        }
     )

     let mailOptions = {
        from: 'giamteam420@hotmail.com',
        to: `${email}`,
        subject: 'Prueba de correo electrónico con HTML',
        html: contentHTML
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Correo electrónico enviado: ' + info.response);
        }
    

})

}




module.exports = {sendEmail};