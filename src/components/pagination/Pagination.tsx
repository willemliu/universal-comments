import React from 'react';
import styles from './Pagination.module.scss';

interface Props {
    hasPrev: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

function Pagination(props: Props) {
    function onPrevious() {
        if (props.hasPrev) {
            props.onPrevious();
        }
    }

    function onNext() {
        if (props.hasNext) {
            props.onNext();
        }
    }

    return (
        <nav className={styles.pagination}>
            <a
                onClick={onPrevious}
                className={`${props.hasPrev ? '' : styles.disabled}`}
            >
                ⬅️ <span>Previous</span>
            </a>
            <a
                onClick={onNext}
                className={`${props.hasNext ? '' : styles.disabled}`}
            >
                <span>Next</span> ➡️
            </a>
        </nav>
    );
}

export { Pagination };
