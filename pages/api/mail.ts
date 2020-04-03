import Mailjet from 'node-mailjet';
import { getOtherUsers } from '../../src/utils/apolloClient';

declare let process: any;

async function mail(req: any, res: any) {
    const API_KEY = process.env.MAILJET_API_KEY;
    const SECRET_KEY = process.env.MAILJET_SECRET_KEY;
    const mailjet = Mailjet.connect(API_KEY, SECRET_KEY);
    const messages = [];
    let otherUsers;

    try {
        const url = req.body.url;
        const uuid = req.body.uuid;
        const commentUuid = req.body.commentUuid;

        if (uuid && commentUuid && url) {
            otherUsers = await getOtherUsers(url, uuid, commentUuid);
            otherUsers?.users?.forEach?.((user) => {
                if (otherUsers?.comments?.length) {
                    messages.push({
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
<p>A new comment has been has been posted here: <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>.</p>
<h3>New comment:</h3>
<h2 style="text-align: center;">"${otherUsers?.comments?.[0]?.comment}"</h2>
<small>You're receiving this e-mail because you've left a comment at this url before.</small>
    `,
                    });
                }
            });
        }

        if (messages.length) {
            const request = mailjet.post('send', { version: 'v3.1' }).request({
                Messages: messages,
            });
            await request.then(console.log);
        }

        res.status(200).json({ status: 'OK', messages });
    } catch (e) {
        console.error(e);
        res.status(504).json({ error: e });
    }
}

export default mail;
