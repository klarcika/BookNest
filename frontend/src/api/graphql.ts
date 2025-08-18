import { graphqlApi } from "../api";

type GqlBook = {
    bookId: string;
    title?: string | null;
    pages?: number | null;
    genre?: string[] | null;
    finishedAt?: string | null;
};

type GqlCoach = {
    status?: string | null;
    daysLeft?: number | null;
    note?: string | null;
};

type GqlGoalWithBooks = {
    id: string;
    userId: string;
    year: number;
    targetBooks: number;
    completedBooks: number;
    createdAt: string;
    books: GqlBook[];
    coach?: GqlCoach | null;
};

export async function fetchGoalWithBooks(userId: string) {
    const query = `
    query GoalWithBooks($uid: String!) {
        goal_with_books(userId: $uid) {
            id
            userId
            year
            targetBooks
            completedBooks
            createdAt
            coach { status daysLeft note }
            books {
                bookId
                title
                pages
                genre
                finishedAt
            }
        }
        }
    `;
    const variables = { uid: userId };

    const res = await graphqlApi.post("", { query, variables });
    const data = res.data?.data?.goal_with_books as GqlGoalWithBooks | null;
    return data;
}
