import React from 'react';
import styles from './Charts.module.scss';

interface Props {
    hasPrevious?: boolean;
    hasNext?: boolean;
    onPreviousClick: () => void;
    onNextClick: () => void;
    showDisplayName?: boolean;
    title?: string;
    latestComments?: any[];
}

function Charts(props: Props) {
    return (
        <section className={styles.charts}>
            {!!props?.latestComments?.length && (
                <article className={styles.chart}>
                    <h2>{props.title}</h2>
                    <ol>
                        <li
                            className={styles.nav}
                            hidden={!props.hasPrevious && !props.hasNext}
                        >
                            <a
                                onClick={props.onPreviousClick}
                                title="Previous"
                                hidden={!props.hasPrevious}
                            >
                                &lt;
                            </a>
                            <a
                                onClick={props.onNextClick}
                                title="Next"
                                hidden={!props.hasNext}
                            >
                                &gt;
                            </a>
                        </li>
                        {props.latestComments?.map?.((comment) => (
                            <li
                                key={comment.id}
                                className={
                                    comment?.scores_aggregate?.aggregate?.sum
                                        ?.score > -1
                                        ? ''
                                        : styles.negative
                                }
                            >
                                <a
                                    href={
                                        comment.url.indexOf('http') === 0
                                            ? comment.url
                                            : 'https://example.com'
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`${new Date(
                                        comment.timestamp
                                    ).toLocaleString()}`}
                                >
                                    <div
                                        title={
                                            comment.edited_comment ??
                                            comment.comment
                                        }
                                    >
                                        {comment.edited_comment ??
                                            comment.comment}
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
                                    {props.showDisplayName && (
                                        <span title={comment.user.display_name}>
                                            &middot; {comment.user.display_name}
                                        </span>
                                    )}
                                    <a
                                        href={
                                            comment.url.indexOf('http') === 0
                                                ? comment.url
                                                : 'https://example.com'
                                        }
                                        target="_BLANK"
                                        title={comment.url}
                                        rel="noopener noreferrer"
                                    >
                                        {new URL(
                                            comment.url.indexOf('http') === 0
                                                ? comment.url
                                                : 'https://example.com'
                                        )?.hostname?.replace(/^www\./, '')}
                                    </a>
                                </small>
                            </li>
                        ))}
                        <li
                            className={styles.nav}
                            hidden={!props.hasPrevious && !props.hasNext}
                        >
                            <a
                                onClick={props.onPreviousClick}
                                title="Previous"
                                hidden={!props.hasPrevious}
                            >
                                &lt;
                            </a>
                            <a
                                onClick={props.onNextClick}
                                title="Next"
                                hidden={!props.hasNext}
                            >
                                &gt;
                            </a>
                        </li>
                    </ol>
                </article>
            )}
        </section>
    );
}

export { Charts };
