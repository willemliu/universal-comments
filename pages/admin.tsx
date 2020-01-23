import React, { useState } from 'react';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getAllUserComments } from '../src/utils/apolloClient';
import { AdminComments } from '../src/components/AdminComments';

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
            {loading ? <div className="blink">Loading...</div> : null}
            <AdminComments onAccess={onAccess} onLogout={onLogout} />
            <small>Universal comments admin</small>
        </>
    );
}
