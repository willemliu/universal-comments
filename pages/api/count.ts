import Cors from 'micro-cors';
import { getCommentCount } from '../../src/utils/apolloClient';
const cors = Cors({
    allowMethods: ['GET', 'HEAD'],
    allowHeaders: [
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'X-HTTP-Method-Override',
        'Content-Type',
        'Authorization',
        'Accept',
        'Cache-Control',
    ],
});

async function count(request: any, response: any) {
    response.setHeader(
        'Cache-Control',
        'max-age=0, s-maxage=60, stale-while-revalidate'
    );

    const url = request.query.canonical;

    try {
        const count = await getCommentCount(url.replace(/\/$/, ''));

        response.status(200).json({ count });
    } catch (e) {
        console.error(e);
        response.status(200).json({ count: 0 });
    }
}

export default cors(count);
