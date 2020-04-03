import Mailjet from 'node-mailjet';
import { getOtherUsersFromCircle } from '../../src/utils/apolloClient';

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
        const circleId = req.body.circleId;

        if (uuid && commentUuid && url && circleId) {
            otherUsers = await getOtherUsersFromCircle(
                url,
                uuid,
                commentUuid,
                circleId
            );
            otherUsers?.users?.forEach?.((user) => {
                if (otherUsers?.comments?.length) {
                    const circleName = user.users_circles?.[0]?.circle?.name;
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
                        Subject: `New comment in circle: ${circleName}`,
                        TextPart: `
A new comment has been has been posted in the circle [${circleName}] here: ${url}.

"${otherUsers?.comments?.[0]?.comment}"

You're receiving this e-mail because you've left a comment at this url before.`,
                        HTMLPart: `
<p>A new comment has been has been posted here: <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>.</p>
<h3>New comment in circle [${circleName}]:</h3>
<h2 style="text-align: center;">"${otherUsers?.comments?.[0]?.comment}"</h2>
<small>You're receiving this e-mail because you've left a comment at this url before.</small>
    `,
                    });
                }
            });
        } else {
            console.error('Missing values');
        }

        if (messages.length) {
            const request = mailjet.post('send', { version: 'v3.1' }).request({
                Messages: messages,
            });
            await request;
        }

        res.status(200).json({ status: 'OK', messages });
    } catch (e) {
        console.error(e);
        res.status(504).json({ error: e });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

export default mail;
