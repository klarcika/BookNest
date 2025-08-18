import React, { use, useState, useEffect } from "react";
import { reviewApi, statisticApi } from "../api";

const GoalContainer = () => {
    const [showModal, setShowModal] = useState(false);
    const [books, setBooks] = useState([]);
    const [goal, setGoal] = useState({});
    const [coach, setCoach] = useState({});

    const [isEditing, setIsEditing] = useState(false);
    const [editTargetBooks, setEditTargetBooks] = useState(1);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState("");

    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");


    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const fetchGoalBooks = async () => {
            try {
                const res = await statisticApi.get(`/goals/user/${userId}`);
                if (res.status === 200) {
                    setGoal(res.data.data);
                    if (res.data.data?.books?.length > 0) {
                        setBooks(res.data.data.books);
                        console.log("Books for goal:", res.data.data.books);
                    } else {
                        setBooks([]);
                    }
                    if (res.data.coach) {
                        setCoach(res.data.coach);
                    } else {
                        setCoach({});
                    }
                } else {
                    setGoal({});
                    setBooks([]);
                    setCoach({});
                }
            } catch (error) {
                setGoal({});
                setBooks([]);
                setCoach({});
                console.error("Failed to fetch goals:", error);
            }
        };
        fetchGoalBooks();
    }, []);


    const isGoalEmpty = Object.keys(goal).length === 0 && goal.constructor === Object;

    const [targetBooks, setTargetBooks] = useState(1);

    const handleDelete = async () => {
        setDeleteError("");
        const goalId = goal.id || goal._id;
        if (!goalId) {
            setDeleteError("Goal id is missing.");
            return;
        }

        const ok = window.confirm("Delete this goal? This cannot be undone.");
        if (!ok) return;

        try {
            setDeleting(true);
            const res = await statisticApi.delete(`/goals/${goalId}`);
            if (res.status === 200) {
                // wipe local UI
                setGoal({});
                setBooks([]);
                setCoach({});
                setIsEditing(false);
            } else {
                setDeleteError("Could not delete the goal. Try again.");
            }
        } catch (err) {
            console.error("Failed to delete goal:", err);
            // Show server message for 400/404 from your docs if present
            setDeleteError(
                err?.response?.data?.message || "Failed to delete the goal. Try again."
            );
        } finally {
            setDeleting(false);
        }
    };


    const handleCreate = async () => {
        const userId = localStorage.getItem("userId");
        try {
            const res = await statisticApi.post("/goals", {
                userId,
                targetBooks: Number(targetBooks)
            });
            if (res.status === 201) {
                setGoal(res.data.data);
                setEditTargetBooks(res.data.data.targetBooks || Number(targetBooks));

            }
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
    };

    const startEdit = () => {
        setEditError("");
        setEditTargetBooks(goal.targetBooks || 1);
        setIsEditing(true);
    };

    // --- NEW: cancel editing
    const cancelEdit = () => {
        setEditError("");
        setEditTargetBooks(goal.targetBooks || 1);
        setIsEditing(false);
    };

    // --- NEW: save edited targetBooks
    const saveEdit = async () => {
        const userId = localStorage.getItem("userId");
        const nextVal = Number(editTargetBooks);
        if (!Number.isFinite(nextVal) || nextVal < 1) {
            setEditError("Please enter a valid number ≥ 1.");
            return;
        }

        setSavingEdit(true);
        setEditError("");

        try {
            const goalId = goal.id || goal._id;
            if (!goalId) {
                setEditError("Goal id is missing.");
                setSavingEdit(false);
                return;
            }

            const res = await statisticApi.put(`/goals/${goalId}/targetBooks`, {
                targetBooks: nextVal,
            });

            if (res.status === 200) {
                setGoal(res.data.data);
                setIsEditing(false);
            } else {
                setEditError("Could not update goal. Try again.");
            }
        } catch (err) {
            console.error("Failed to update goal:", err);
            setEditError(
                err?.response?.data?.message || "Failed to update goal. Try again."
            );
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div>
            {isGoalEmpty ? (
                <div className="flex flex-col items-start gap-2 mb-4">
                    <label htmlFor="targetBooks" className="font-medium">Number of books for your goal:</label>
                    <input
                        id="targetBooks"
                        type="number"
                        min={1}
                        value={targetBooks}
                        onChange={e => setTargetBooks(e.target.value)}
                        className="border rounded px-2 py-1 w-32"
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                    >
                        Create Reading Goal
                    </button>
                </div>
            ) : (
                <div className="p-4 border rounded shadow mt-4">
                    <h2 className="text-xl font-semibold mb-2">Your Reading Goal</h2>
                    <p>
                        <strong>Goal: </strong>
                        {goal.completedBooks} / {goal.targetBooks}
                    </p>
                    <p>
                        <strong>Progress:</strong> {coach.status}
                    </p>
                    <p>
                        <strong>Days left:</strong> {coach.daysLeft}
                    </p>
                    <p>
                        <strong>Note:</strong> {coach.note}
                    </p>

                    {!isEditing ? (
                        <button
                            onClick={startEdit}
                            className="bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400 text-white font-medium py-1 px-3 rounded mt-3 transition-colors"
                        >
                            Edit goal
                        </button>
                    ) : (
                        <div className="mt-3 flex items-center gap-2">
                            <label htmlFor="editTargetBooks" className="font-medium">
                                Target books:
                            </label>
                            <input
                                id="editTargetBooks"
                                type="number"
                                min={1}
                                value={editTargetBooks}
                                onChange={(e) => setEditTargetBooks(e.target.value)}
                                className="border rounded px-2 py-1 w-28"
                            />
                            <button
                                onClick={saveEdit}
                                disabled={savingEdit}
                                className={`${savingEdit
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-700"
                                    } text-white font-semibold py-1 px-3 rounded`}
                            >
                                {savingEdit ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={cancelEdit}
                                disabled={savingEdit}
                                className="bg-white border hover:bg-gray-50 text-gray-800 font-medium py-1 px-3 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {editError && (
                        <p className="text-red-600 text-sm mt-1">{editError}</p>
                    )}

                    {/* Delete controls */}
                    <div className="mt-4">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className={`${deleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                                } text-white font-semibold py-1 px-3 rounded`}
                        >
                            {deleting ? "Deleting..." : "Delete goal"}
                        </button>
                        {deleteError && (
                            <p className="text-red-600 text-sm mt-2">{deleteError}</p>
                        )}
                    </div>


                    {goal.books && goal.books.length > 0 && (
                        <div className="mt-4">
                            <strong>Books:</strong>
                            <ul className="list-disc ml-6">
                                {goal.books.map((book, idx) => (
                                    <li key={idx}>{book.title || JSON.stringify(book)}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GoalContainer;
