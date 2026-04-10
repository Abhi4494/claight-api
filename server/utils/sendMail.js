import ejs from "ejs";
import path from "path";
import mailer from "../config/mailer.js";

const sendMail = async (to, subject, template, templateData) => {
    const templatePath = path.join('server', 'views', 'templates', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    await mailer.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
    });
};

export default sendMail;
