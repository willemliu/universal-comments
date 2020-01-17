import React, { useState } from 'react';
import Head from 'next/head';
import { FBSDK } from '../src/components/social/login/FacebookLogin';
import { GoogleSDK } from '../src/components/social/login/GoogleLogin';
import CommentsStore from '../src/stores/CommentsStore';
import { getApolloClient } from '../src/utils/apolloClient';
import { gql } from 'apollo-boost';
import { Comments } from '../src/components/Comments';

export default function admin() {
    const [loading, setLoading] = useState(false);

    function onAccess(accessToken: string) {
        setLoading(true);
        const client = getApolloClient();
        client
            .query({
                variables: {
                    accessToken,
                },
                query: gql`
                    query($accessToken: String!) {
                        comments(
                            where: {
                                user: { token: { _eq: $accessToken } }
                                removed: { _eq: false }
                            }
                            order_by: { timestamp: asc }
                        ) {
                            id
                            url
                            comment
                            parent_id
                            timestamp
                            updated
                            removed
                            user {
                                id
                                display_name
                                image
                            }
                            scores_aggregate {
                                aggregate {
                                    sum {
                                        score
                                    }
                                }
                            }
                        }
                    }
                `,
            })
            .then((value) => {
                CommentsStore.setComments(value?.data?.comments);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <Head>
                <title>Admin - Universal Comments</title>
            </Head>
            {loading ? <div className="blink">Loading...</div> : <Comments />}
            <Comments
                title={'Comments Admin'}
                onAccess={onAccess}
                noForm={true}
            />
            <small>Universal comments admin</small>
        </>
    );
}
