"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState(1);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (date) {
            const fetchAvailability = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/availability?date=${date}`);
                    console.log("Available Slots:", response.data.availableSlots);
                    setAvailableSlots(response.data.availableSlots);
                    setTime(''); // Reset time when date changes
                } catch (error) {
                    console.error("Error fetching availability:", error);
                }
            };
            fetchAvailability();
        }
    }, [date]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/booking', {
                date, 
                time,
                guests,
                name,
                contact,
            });
            setMessage(`Booking confirmed for ${response.data.name} on ${response.data.date} at ${response.data.time}.`);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div>
            <h1>Table Booking</h1>
            <form onSubmit={handleSubmit}>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                <select value={time} onChange={(e) => setTime(e.target.value)} required>
                    <option value="">Select Time</option>
                    {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))
                    ) : (
                        <option value="">No available slots</option>
                    )}
                </select>
                <input type="number" value={guests} onChange={(e) => setGuests(e.target.value ? parseInt(e.target.value) : 0)} min="1" required />
                <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="text" placeholder="Contact Details" value={contact} onChange={(e) => setContact(e.target.value)} required />
                <button type="submit">Book Table</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
