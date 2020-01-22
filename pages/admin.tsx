import React, { useState } from 'react';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getAllUserComments } from '../src/utils/apolloClient';
import { Comments } from '../src/components/Comments';

export default function admin() {
    const [loading, setLoading] = useState(false);

    async function onAccess(accessToken: string, uuid: string) {
        setLoading(true);
        try {
            CommentsStore.setComments(await getAllUserComments(uuid));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function onLogout() {
        CommentsStore.setComments([]);
    }

    return (
        <>
            <Head>
                <title>Admin - Universal Comments</title>
            </Head>
            {loading ? (
                <div className="blink">Loading...</div>
            ) : (
                <Comments
                    title={'Comments Admin'}
                    onAccess={onAccess}
                    onLogout={onLogout}
                    noForm={true}
                />
            )}
            <small>Universal comments admin</small>
        </>
    );
}
