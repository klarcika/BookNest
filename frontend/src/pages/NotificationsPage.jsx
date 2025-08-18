import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { notificationApi } from "../api";

const NotificationsPage = () => {
    const { id } = useParams(); // uporabnikId iz URL
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.get(
                `/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } }
            );
            setNotifications(res.data || []);
        } catch (err) {
            setError(err?.response?.data?.sporocilo || "Napaka pri pridobivanju obvestil");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [id]);

    if (loading) return <p className="text-center">⏳ Nalaganje...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">🔔 Obvestila</h1>
            {notifications.length === 0 ? (
                <p className="text-gray-600">Ni obvestil za tega uporabnika.</p>
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
