import React, { useState, useEffect } from 'react';
import { getLatestPublicComments } from '../../utils/apolloClient';
import styles from './Charts.module.scss';

function Charts() {
    const [latestComments, setLatestComments] = useState([]);

    useEffect(() => {
        getLatestPublicComments(10).then(setLatestComments);
    }, []);

    return (
        <section className={styles.charts}>
            <article className={styles.chart}>
                <h2>Latest comments</h2>
                <ol>
                    {latestComments.map((comment) => (
                        <li key={comment.id}>
                            <a
                                href={comment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${new Date(
                                    comment.timestamp
                                ).toLocaleString()} by ${
                                    comment.user.display_name
                                }`}
                            >
                                {comment.url} -{' '}
                                {new Date(comment.timestamp).toLocaleString()}
                            </a>
                        </li>
                    ))}
                </ol>
            </article>
        </section>
    );
}

export { Charts };
