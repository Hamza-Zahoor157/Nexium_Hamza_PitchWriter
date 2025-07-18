'use client'

import { useEffect, useState } from 'react'

export default function PitchPage() {
    const [idea, setIdea] = useState('')
    const [response, setResponse] = useState(null)
    const [userId, setUserId] = useState('hamza123') // hardcoded user ID for now
    const [pitches, setPitches] = useState<{ idea: string; response: any }[]>([])

    // Fetch past pitches on load
    useEffect(() => {
        const fetchPitches = async () => {
            if (!userId) return  // skip if userId isn't set yet
            const res = await fetch(`/api/pitch/user/${userId}`)
            const data = await res.json()
            setPitches(data.pitches || [])
        }
    
        fetchPitches()
    }, [userId]) // <- ADD userId here
    

    // Handle pitch submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('/api/pitch/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea, userId }),
        })

        const data = await res.json()
        setResponse(data.data.response)

        // Update pitch list
        setPitches(prev => [{ idea, response: data.data.response }, ...prev])
        setIdea('')
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">AI Pitch Generator</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Enter your startup idea..."
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={4}
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Generate Pitch
                </button>
            </form>

            {response && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h2 className="font-semibold mb-2">Generated Response:</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}

            <hr className="my-8" />

            <h2 className="text-xl font-semibold mb-2">Past Pitches</h2>
            <ul className="space-y-4">
                {pitches.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Past Pitches</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pitches.map((pitch, index) => (
                                <div
                                    key={index}
                                    className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition duration-300"
                                >
                                    <h3 className="text-lg font-medium text-indigo-600 mb-2">💡 {pitch.idea}</h3>
                                    <div>
                                        <h4 className="font-bold">{pitch.response.title}</h4>
                                        <p className="text-gray-700 whitespace-pre-line">{pitch.response.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </ul>
        </div>
    )
}
