import Cors from 'micro-cors';
const cors = Cors({ allowMethods: ['GET', 'HEAD'] });
import Mailjet from 'node-mailjet';
import { getOtherUsers } from '../../src/utils/apolloClient';

declare let process: any;

async function mail(req: any, res: any) {
    const API_KEY = process.env.MAILJET_API_KEY;
    const SECRET_KEY = process.env.MAILJET_SECRET_KEY;
    const mailjet = Mailjet.connect(API_KEY, SECRET_KEY);
    const mailPromises = [];
    const mailResults = [];
    let otherUsers;

    try {
        const url = req.query.url;
        if (req.query.uuid && req.query.commentUuid && url) {
            otherUsers = await getOtherUsers(
                url,
                req.query.uuid,
                req.query.commentUuid
            );
            otherUsers?.users?.forEach?.((user) => {
                console.log(
                    user.email,
                    user.display_name,
                    otherUsers?.comments?.length
                );
                if (otherUsers?.comments?.length) {
                    const request = mailjet
                        .post('send', { version: 'v3.1' })
                        .request({
                            Messages: [
                                {
                                    From: {
                                        Email: 'noreply@willim.nl',
                                        Name: 'Universal Comments',
                                    },
                                    To: [
                                        {
                                            Email: user.email,
                                            Name: user.display_name,
                                        },
                                    ],
                                    Subject: `New comment: ${url}`,
                                    TextPart: `
A new comment has been has been posted here: ${url}.

"${otherUsers?.comments?.[0]?.comment}"

You're receiving this e-mail because you've left a comment at this url before.`,
                                    HTMLPart: `
<h3>A new comment</h3>
<p>A new comment has been has been posted here: <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>.</p>
<h2>"${otherUsers?.comments?.[0]?.comment}"</h2>
<small>You're receiving this e-mail because you've left a comment at this url before.</small>
                `,
                                },
                            ],
                        });
                    mailPromises.push(request);
                }
            });
        }
        if (mailPromises.length) {
            mailResults.push(...(await Promise.all(mailPromises)));
            console.log(mailResults);
        }
        res.status(200).json({ status: 'OK', mailResults: mailResults.length });
    } catch (e) {
        console.error(e);
        res.status(504).json({ error: e });
    }
}

export default cors(mail);
