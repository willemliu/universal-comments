import React, { useState, useEffect } from 'react';
import { gql } from 'apollo-boost';
import { getApolloClient } from '../src/utils/apolloClient';
import { Comments } from '../src/components/Comments';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getCanonical } from '../src/utils/url';

function Index() {
    const [loading, setLoading] = useState(true);
    const [commentUrl, setCommentUrl] = useState('');
    const [canonical, setCanonical] = useState(null);

    useEffect(() => {
        const url = getCanonical();
        setCanonical(url);

        const client = getApolloClient();
        client
            .query({
                variables: { url },
                query: gql`
                    query($url: String!) {
                        comments(
                            where: { url: { _eq: $url } }
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
                setCommentUrl(url);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Head>
                <title>Universal Comments</title>
                {canonical ? <link rel="canonical" href={canonical} /> : null}
            </Head>

            <section className="adminLinks">
                <a href="/circles" target="_blank" rel="noopener noreferrer">
                    Manage Circles⚙️
                </a>
                <a href="/admin" target="_blank" rel="noopener noreferrer">
                    Manage Your Comments⚙️
                </a>
            </section>

            {loading ? <div className="blink">Loading...</div> : <Comments />}

            <small>
                Universal comments
                <div>
                    Canonical:{' '}
                    <a
                        href={commentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {commentUrl}
                    </a>
                </div>
                <div>
                    <a
                        href="https://raw.githubusercontent.com/willemliu/universal-comments/master/20200118privacy.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy statement
                    </a>
                </div>
            </small>
        </>
    );
}

export default Index;
