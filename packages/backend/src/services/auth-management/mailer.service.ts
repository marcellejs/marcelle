import { Service } from 'feathers-mailer';
import nodemailer from 'nodemailer';
import { Application } from '../../declarations';

export async function mailer(app: Application) {
  const from = app.get('authentication')['email-validation'].smtp.from;
  if (app.get('authentication')['email-validation'].smtp.host === 'localhost') {
    const account = await nodemailer.createTestAccount(); // internet required
    console.log('TestMailerAccount:', account);

    const transport = {
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure, // 487 only
      requireTLS: true,
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass, // generated ethereal password
      },
    };

    app.use('emails', new Service(transport, { from }));
  } else {
    const transport = {
      host: app.get('authentication')['email-validation'].smtp.host,
      port: app.get('authentication')['email-validation'].smtp.port,
      secure: false,
      // requireTLS: true,
      auth: {
        user: app.get('authentication')['email-validation'].smtp.user,
        pass: app.get('authentication')['email-validation'].smtp.password,
      },
    };

    console.log('transport', transport);
    app.use('emails', new Service(transport, { from }));
  }
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    emails: Service;
  }
}
