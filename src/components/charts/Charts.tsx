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
                                    {props.showDisplayName && (
                                        <span title={comment.user.display_name}>
                                            &middot; {comment.user.display_name}
                                        </span>
                                    )}
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
