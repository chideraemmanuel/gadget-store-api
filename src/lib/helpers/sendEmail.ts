import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../config/nodemailer';

interface MailOptions {
  receipent: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ receipent, subject, html }: MailOptions) => {
  const mailOptions = {
    from: process.env.AUTH_EMAIL!,
    to: receipent,
    subject,
    html,
  };

  return new Promise<SMTPTransport.SentMessageInfo>((resolve, reject) => {
    transporter.sendMail(mailOptions, (error: any, info) => {
      if (error) {
        reject(error);
      }

      resolve(info);
    });
  });
};

export default sendEmail;
