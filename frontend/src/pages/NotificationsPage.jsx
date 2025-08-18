import React, { useEffect, useState } from "react";
import { notificationApi } from "../api";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            setError("Uporabnik ni prijavljen");
            setLoading(false);
            return;
        }

        try {
            // Pošljemo token, backend bo filtriral obvestila po prijavljenem uporabniku
            const res = await notificationApi.get("/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Preverimo, če je res.data array
            if (Array.isArray(res.data)) {
                setNotifications(res.data);
            } else {
                setNotifications([]);
                setError("Nepričakovani format podatkov z backend-a");
            }
        } catch (err) {
            console.error("Napaka pri pridobivanju obvestil:", err);

            // Poskušamo vzeti napako iz backend response, sicer default sporočilo
            const backendError = err?.response?.data?.sporocilo || "Napaka pri pridobivanju obvestil";
            setError(backendError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <p className="text-center">⏳ Nalaganje...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">🔔 Moja obvestila</h1>

            {notifications.length === 0 ? (
                <p className="text-gray-600">Trenutno ni obvestil.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((n) => (
                        <li key={n._id} className="bg-white shadow rounded p-4">
                            <p className="text-lg text-gray-800">{n.vsebina?.sporocilo}</p>

                            {n.vsebina?.knjigaId && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Knjiga: {n.vsebina.naslovKnjige} ({n.vsebina.avtor})
                                </p>
                            )}
                            {n.vsebina?.prijatelj && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {n.vsebina.prijatelj} je ocenil {n.vsebina.naslovKnjige} z {n.vsebina.ocena}⭐
                                </p>
                            )}
                            {n.vsebina?.nazivIzziva && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Izziv: {n.vsebina.nazivIzziva} – {n.vsebina.status}
                                </p>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.datumUstvarjeno).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
