import Cors from 'micro-cors';
import { gql } from 'apollo-boost';
import { getApolloClient } from '../../src/utils/apolloClient';
const cors = Cors({ allowMethods: ['GET', 'HEAD'] });

async function count(request: any, response: any) {
    response.setHeader(
        'Cache-Control',
        'max-age=0, s-maxage=1, stale-while-revalidate'
    );

    const url = request.query.canonical;
    const client = getApolloClient();

    try {
        const count =
            (await client
                .query({
                    variables: {
                        url,
                    },
                    query: gql`
                        query($url: String!) {
                            comments_aggregate(where: { url: { _eq: $url } }) {
                                aggregate {
                                    count
                                }
                            }
                        }
                    `,
                })
                .then(({ data }: any) => {
                    return data?.comments_aggregate?.aggregate?.count;
                })) || 0;

        response.status(200).json({ count });
        console.log(count, url);
    } catch (e) {
        console.error(e);
    }
}

export default cors(count);
