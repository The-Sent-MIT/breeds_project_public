'use client';

import { useState, useRef } from 'react';
import axios from 'axios';

export default function AudioTranscriptionPage() {
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus',
        });

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            const formData = new FormData();
            formData.append('audio', audioBlob);

            try {
                const res = await axios.post('/api/ai/audio', formData);
                setTranscript(res.data.transcript ?? 'No transcript');
            } catch (err) {
                console.error('Transcription error:', err);
                setTranscript('Transcription failed');
            }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900"
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            <div className="mt-4 p-4 bg-gray-100 rounded">
                <b>Transcript:</b>
                <p>{transcript}</p>
            </div>
        </div>
    );
}
