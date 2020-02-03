import Cors from 'micro-cors';
import { getCommentCount } from '../../src/utils/apolloClient';
const cors = Cors({ allowMethods: ['GET', 'HEAD'] });

async function count(request: any, response: any) {
    response.setHeader(
        'Cache-Control',
        'max-age=0, s-maxage=1, stale-while-revalidate'
    );

    const url = request.query.canonical;

    try {
        const count = await getCommentCount(url);

        response.status(200).json({ count });
    } catch (e) {
        console.error(e);
    }
}

export default cors(count);
