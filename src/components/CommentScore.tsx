import React from 'react';
import styles from './CommentScore.module.css';

interface Props {
    score?: number;
    onVoteUp: () => void;
    onVoteNeutral: () => void;
    onVoteDown: () => void;
}
function CommentScore(props: Props) {
    return (
        <span className={styles.commentsScore}>
            <a
                onClick={props.onVoteUp}
                className={styles.commentScoreButton}
                title="Relevant"
            >
                👍
            </a>
            <a
                onClick={props.onVoteNeutral}
                className={styles.commentScore}
                title="reset vote"
            >
                {props.score || 0}
            </a>
            <a
                onClick={props.onVoteDown}
                className={styles.commentScoreButton}
                title="Irrelevant"
            >
                👎
            </a>
        </span>
    );
}

export { CommentScore };
