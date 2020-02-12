import React, { useState } from 'react';
import styles from './Charts.module.scss';

interface Props {
    circle?: string;
    latestComments?: any[];
}

function Charts(props: Props) {
    const [isPublic] = useState(!!props.circle);

    return (
        <section className={styles.charts}>
            {!!props?.latestComments?.length && (
                <article className={styles.chart}>
                    <h2>Latest comments</h2>
                    <ol>
                        {props.latestComments?.map?.((comment) => (
                            <li key={comment.id}>
                                <a
                                    href={comment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`${new Date(
                                        comment.timestamp
                                    ).toLocaleString()}`}
                                >
                                    <div title={comment.comment}>
                                        {comment.comment}
                                    </div>
                                </a>
                                <small>
                                    <span
                                        title={new Date(
                                            comment.timestamp
                                        ).toLocaleString()}
                                    >
                                        {new Date(
                                            comment.timestamp
                                        ).toLocaleString()}
                                    </span>
                                    {isPublic && (
                                        <span title={comment.user.display_name}>
                                            &middot; {comment.user.display_name}
                                        </span>
                                    )}
                                </small>
                            </li>
                        ))}
                    </ol>
                </article>
            )}
        </section>
    );
}

export { Charts };
