import React from 'react';
import { CommentCard } from '../../src/components/CommentCard';
import { render, queryByText } from '@testing-library/react';
import UserStore from '../../src/stores/UserStore';

describe('CommentCard', () => {
    test('should render logged out correctly', () => {
        const date = new Date('2020-02-24 10:08:00');
        const { getAllByText, queryByTitle } = render(
            <CommentCard
                id="uuid-of-comment"
                comment="The comment text"
                displayName="Willem Liu"
                image="https://default.image"
                timestamp={`${date.toLocaleString()}`}
                url="https://willemliu.nl"
                userUuid="uuid-of-user"
            />
        );

        expect(getAllByText('The comment text', { exact: false }).length).toBe(
            1
        );
        expect(getAllByText('Willem Liu', { exact: false }).length).toBe(1);
        expect(getAllByText('Score:', { exact: false })).toBeTruthy();
        expect(queryByTitle(/View changes/i)).toBeNull();
        expect(queryByTitle(/Remove comment/i)).toBeNull();
        expect(queryByTitle(/Go to/i)).toBeNull();
        expect(queryByTitle(/Edit/i)).toBeNull();
        expect(queryByTitle(/Reply/i)).toBeNull();
        expect(
            getAllByText(
                `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
    });

    test('should render update correctly', () => {
        const date = new Date('2020-02-24 10:08:00');
        const updateDate = new Date('2021-03-25 11:09:01');
        const { getAllByText, queryByTitle } = render(
            <CommentCard
                id="uuid-of-comment"
                comment="The comment text"
                displayName="Willem Liu"
                image="https://default.image"
                timestamp={`${date.toLocaleString()}`}
                url="https://willemliu.nl"
                userUuid="uuid-of-user"
                updated={`${updateDate.toLocaleString()}`}
            />
        );

        expect(getAllByText('The comment text', { exact: false }).length).toBe(
            1
        );
        expect(getAllByText('Willem Liu', { exact: false }).length).toBe(1);
        expect(queryByTitle(/View changes/i)).toBeNull();
        expect(
            getAllByText(
                `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
        expect(
            getAllByText(
                `Update: ${updateDate.toLocaleTimeString()} ${updateDate.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
    });

    test('should render update with changed comment correctly', () => {
        const date = new Date('2020-02-24 10:08:00');
        const updateDate = new Date('2021-03-25 11:09:01');
        const { getAllByText, getAllByTitle, queryByText } = render(
            <CommentCard
                id="uuid-of-comment"
                comment="The comment text"
                editedComment="The edited comment text"
                displayName="Willem Liu"
                image="https://default.image"
                timestamp={`${date.toLocaleString()}`}
                url="https://willemliu.nl"
                userUuid="uuid-of-user"
                updated={`${updateDate.toLocaleString()}`}
            />
        );

        expect(queryByText(/The comment text/i)).toBeNull();
        expect(
            getAllByText('The edited comment text', { exact: false }).length
        ).toBe(1);
        expect(getAllByText('Willem Liu', { exact: false }).length).toBe(1);
        expect(getAllByTitle('View changes', { exact: false }).length).toBe(1);
        expect(
            getAllByText(
                `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
        expect(
            getAllByText(
                `Update: ${updateDate.toLocaleTimeString()} ${updateDate.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
    });

    test('should render loggedIn correctly', async () => {
        const date = new Date('2020-02-24 10:08:00');
        const updateDate = new Date('2021-03-25 11:09:01');
        const { getAllByText, getAllByTitle, queryByTitle } = render(
            <CommentCard
                id="uuid-of-comment"
                comment="The comment text"
                displayName="Willem Liu"
                image="https://default.image"
                timestamp={`${date.toLocaleString()}`}
                url="https://willemliu.nl"
                userUuid="uuid-of-user"
                updated={`${updateDate.toLocaleString()}`}
                loggedIn={true}
            />
        );

        expect(getAllByText('The comment text', { exact: false }).length).toBe(
            1
        );
        expect(getAllByText('Willem Liu', { exact: false }).length).toBe(1);
        expect(queryByTitle(/View changes/i)).toBeNull();
        expect(queryByTitle(/Remove comment/i)).toBeNull();
        expect(queryByTitle(/Go to/i)).toBeNull();
        expect(queryByTitle(/Edit/i)).toBeNull();
        expect(getAllByTitle('Reply', { exact: false }).length).toBe(1);
        expect(
            getAllByText(
                `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
        expect(
            getAllByText(
                `Update: ${updateDate.toLocaleTimeString()} ${updateDate.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
    });

    test('should render loggedIn with link correctly', () => {
        const date = new Date('2020-02-24 10:08:00');
        const updateDate = new Date('2021-03-25 11:09:01');
        const { getAllByText, getAllByTitle, queryByTitle } = render(
            <CommentCard
                id="uuid-of-comment"
                comment="The comment text"
                displayName="Willem Liu"
                image="https://default.image"
                timestamp={`${date.toLocaleString()}`}
                url="https://willemliu.nl"
                userUuid="uuid-of-user"
                updated={`${updateDate.toLocaleString()}`}
                loggedIn={true}
                showLink={true}
            />
        );

        expect(getAllByText('The comment text', { exact: false }).length).toBe(
            1
        );
        expect(getAllByText('Willem Liu', { exact: false }).length).toBe(1);
        expect(queryByTitle(/View changes/i)).toBeNull();
        expect(queryByTitle(/Remove comment/i)).toBeNull();
        expect(getAllByTitle('Go to:', { exact: false }).length).toBe(1);
        expect(queryByTitle(/Edit/i)).toBeNull();
        expect(getAllByTitle('Reply', { exact: false }).length).toBe(1);
        expect(
            getAllByText(
                `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
        expect(
            getAllByText(
                `Update: ${updateDate.toLocaleTimeString()} ${updateDate.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
    });

    test('should render loggedIn as poster correctly', () => {
        UserStore.setUuid('uuid-of-user');
        const date = new Date('2020-02-24 10:08:00');
        const updateDate = new Date('2021-03-25 11:09:01');
        const { getAllByText, getAllByTitle, queryByTitle } = render(
            <CommentCard
                id="uuid-of-comment"
                comment="The comment text"
                displayName="Willem Liu"
                image="https://default.image"
                timestamp={`${date.toLocaleString()}`}
                url="https://willemliu.nl"
                userUuid="uuid-of-user"
                updated={`${updateDate.toLocaleString()}`}
                loggedIn={true}
                showLink={true}
            />
        );

        expect(getAllByText('The comment text', { exact: false }).length).toBe(
            1
        );
        expect(getAllByText('Willem Liu', { exact: false }).length).toBe(1);
        expect(queryByTitle(/View changes/i)).toBeNull();
        expect(getAllByTitle('Remove comment', { exact: false }).length).toBe(
            1
        );
        expect(getAllByTitle('Go to:', { exact: false }).length).toBe(1);
        expect(getAllByTitle('Edit', { exact: false }).length).toBe(1);
        expect(getAllByTitle('Reply', { exact: false }).length).toBe(1);
        expect(
            getAllByText(
                `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
        expect(
            getAllByText(
                `Update: ${updateDate.toLocaleTimeString()} ${updateDate.toLocaleDateString()}`,
                {
                    exact: false,
                }
            ).length
        ).toBe(1);
    });
});
