import Cors from 'micro-cors';
const cors = Cors({ allowMethods: ['GET', 'HEAD'] });
import Mailjet from 'node-mailjet';

declare let process: any;

async function mail(req: any, res: any) {
    const API_KEY = process.env.MAILJET_API_KEY;
    const SECRET_KEY = process.env.MAILJET_SECRET_KEY;
    const mailjet = Mailjet.connect(API_KEY, SECRET_KEY);
    // const request = mailjet.post('send', { version: 'v3.1' }).request({
    //     Messages: [
    //         {
    //             From: {
    //                 Email: 'pilot@mailjet.com',
    //                 Name: 'Mailjet Pilot',
    //             },
    //             To: [
    //                 {
    //                     Email: 'passenger1@mailjet.com',
    //                     Name: 'passenger 1',
    //                 },
    //             ],
    //             Subject: 'Your email flight plan!',
    //             TextPart:
    //                 'Dear passenger 1, welcome to Mailjet! May the delivery force be with you!',
    //             HTMLPart:
    //                 "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
    //         },
    //     ],
    // });
    // request
    //     .then((result) => {
    //         console.log(result.body);
    //     })
    //     .catch((err) => {
    //         console.log(err.statusCode);
    //     });

    try {
        res.status(200).json({ status: 'OK', API_KEY, SECRET_KEY });
    } catch (e) {
        console.error(e);
    }
}

export default cors(mail);
