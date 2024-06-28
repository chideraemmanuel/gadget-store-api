import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../config/nodemailer';
import axios from 'axios';

interface MailOptions {
  receipent: string;
  subject: string;
  html: string;
}

// const sendEmail = async ({ receipent, subject, html }: MailOptions) => {
//   const mailOptions = {
//     from: process.env.AUTH_EMAIL!,
//     to: receipent,
//     subject,
//     html,
//   };

//   return new Promise<SMTPTransport.SentMessageInfo>((resolve, reject) => {
//     transporter.sendMail(mailOptions, (error: any, info) => {
//       if (error) {
//         reject(error);
//       }

//       resolve(info);
//     });
//   });
// };

// export default sendEmail;

const sendEmail = async ({ receipent, subject, html }: MailOptions) => {
  const response = await axios.post<Promise<any>>(
    'https://api.brevo.com/v3/smtp/email',
    JSON.stringify({
      sender: {
        name: 'Gadget Store',
        // change email when sender is added to brevo account
        email: 'emmanuelsomtoh.o@gmail.com',
      },
      to: [{ email: receipent }],
      subject: subject,
      // textContent: 'Hello from Brevo Email API',
      htmlContent: html,
    }),
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
    }
  );

  return response.data;
};

export default sendEmail;
