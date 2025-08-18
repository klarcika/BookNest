import React, { useEffect, useState } from "react";

const MotivationPage = () => {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTips = async () => {
        const token = localStorage.getItem("jwtToken"); // če uporabljaš auth, sicer odstrani

        try {
            const res = await fetch(" http://localhost:5001/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    query: `
            query {
              tips {
                id
                besedilo
                kategorija
              }
            }
          `,
                }),
            });

            const json = await res.json();

            if (json.errors) {
                setError(json.errors[0].message || "Napaka pri pridobivanju nasvetov");
                setTips([]);
            } else {
                setTips(json.data.tips || []);
            }
        } catch (err) {
            console.error(err);
            setError("Napaka pri povezavi z backendom");
            setTips([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTips();
    }, []);

    if (loading) return <p className="text-center">⏳ Nalaganje...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">💡 Nasveti</h1>

            {tips.length === 0 ? (
                <p className="text-gray-600">Trenutno ni nasvetov.</p>
            ) : (
                <ul className="space-y-4">
                    {tips.map((tip) => (
                        <li key={tip.id} className="bg-white shadow rounded p-4">
                            <p className="text-lg text-gray-800">{tip.besedilo}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Kategorija: {tip.kategorija}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MotivationPage;
