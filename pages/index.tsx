import React, { useState, useEffect } from 'react';
import {
    getCommentsByUrl,
    getCommentsByCircleId,
} from '../src/utils/apolloClient';
import { Comments } from '../src/components/Comments';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getCanonical } from '../src/utils/url';
import { Charts } from '../src/components/charts/Charts';

function Index() {
    const [loading, setLoading] = useState(true);
    const [commentUrl, setCommentUrl] = useState('');
    const [canonical, setCanonical] = useState(null);

    useEffect(() => {
        const url = getCanonical();
        setCanonical(url);

        try {
            getCommentsByUrl(url).then((comments) => {
                CommentsStore.setComments(comments);
            });
        } catch (e) {
            console.error(e);
        } finally {
            setCommentUrl(url);
            setLoading(false);
        }
    }, []);

    function handleCircleChange(circleId?: string) {
        const url = getCanonical();
        setCanonical(url);
        try {
            if (circleId) {
                getCommentsByCircleId(url, circleId).then((comments) => {
                    CommentsStore.setComments(comments);
                });
            } else {
                getCommentsByUrl(url).then((comments) => {
                    CommentsStore.setComments(comments);
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCommentUrl(url);
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Universal Comments</title>
                {canonical ? <link rel="canonical" href={canonical} /> : null}
            </Head>

            {loading ? (
                <div className="blink">Loading...</div>
            ) : (
                <div className="comments-container">
                    <Comments
                        canonical={canonical}
                        onAccess={console.log}
                        onCircleChange={handleCircleChange}
                    />
                    <Charts />
                </div>
            )}

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
