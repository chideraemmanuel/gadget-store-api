import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.AUTH_EMAIL!,
    pass: process.env.AUTH_PASS!,
  },
});

// transporter.verify((error, success) => {
//   if (error) {
//     console.log('error configuring nodemailer', error);
//   } else {
//     console.log('succesfully configured nodemailer', success);
//   }
// });

export default transporter;
