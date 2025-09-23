import { SendMailOptions } from 'nodemailer';
import { Application } from '../../declarations';
import { NotificationType, User } from 'feathers-authentication-management';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const templateDir = path.join(process.env.NODE_CONFIG_DIR || 'backend/config', 'email-templates');

export default function (app: Application) {
  function getVerifyLink(hash: string) {
    const url = app.get('authentication')['email-validation'].validateTokenURL;
    return url + '?token=' + hash;
  }

  function getResetLink(hash: string) {
    const url = app.get('authentication')['email-validation'].resetPasswordURL;
    return url + '?token=' + hash;
  }

  function composeEmail(type: NotificationType, replaceMap: Record<string, string> = {}) {
    let templateFile = `${templateDir}/${type}.html`;
    if (!existsSync(templateFile)) {
      throw new Error("Email template 'resendVerifySignup.html' could not be found");
    }
    let html = readFileSync(templateFile, { encoding: 'utf8' });
    for (const [key, val] of Object.entries(replaceMap)) {
      html = html.replaceAll(key, val);
    }
    const subjectRegex = /<!--\s*subject:\s*(.*?)\s*-->/i;
    const match = html.match(subjectRegex);
    const subject = match ? match[1].trim() : '[marcelle] automated email';
    return { subject, html };
  }

  async function sendEmail(email: SendMailOptions) {
    try {
      const result = await app.service('emails').create(email);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  return (type: NotificationType, user: Partial<User>, notifierOptions = {}) => {
    if (type === 'resendVerifySignup') {
      const { subject, html } = composeEmail('resendVerifySignup', {
        '{url}': getVerifyLink(user.verifyToken!),
      });
      return sendEmail({
        to: user.email,
        subject,
        html,
      });
    } else if (type === 'verifySignup') {
      const { subject, html } = composeEmail('verifySignup');
      return sendEmail({
        to: user.email,
        subject,
        html,
      });
    } else if (type === 'sendResetPwd') {
      const { subject, html } = composeEmail('sendResetPwd', {
        '{url}': getResetLink(user.resetToken!),
      });
      return sendEmail({
        to: user.email,
        subject,
        html,
      });
    }
  };
}
