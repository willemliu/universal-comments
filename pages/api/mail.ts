import Cors from 'micro-cors';
const cors = Cors({ allowMethods: ['GET', 'HEAD'] });
import Mailjet from 'node-mailjet';

declare let process: any;

async function mail(req: any, res: any) {
    const API_KEY = process.env.MAILJET_API_KEY;
    const SECRET_KEY = process.env.MAILJET_SECRET_KEY;
    const mailjet = Mailjet.connect(API_KEY, SECRET_KEY);

    try {
        let mailResult;
        if (req.query.email && req.query.name) {
            const request = mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'noreply@willim.nl',
                            Name: 'Universal Comments',
                        },
                        To: [
                            {
                                Email: req.query.email,
                                Name: req.query.name,
                            },
                        ],
                        Subject: 'Testing 123',
                        TextPart: `Well this is nice isn't it?`,
                        HTMLPart: `<h3>Well this is nice isn't it?</h3>`,
                    },
                ],
            });

            mailResult = request.then((result) => result);
        }
        res.status(200).json({ status: 'OK', API_KEY, SECRET_KEY, mailResult });
    } catch (e) {
        console.error(e);
    }
}

export default cors(mail);
