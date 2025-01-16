// import React, { useState, useEffect, useCallback } from "react";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import useClipboard from "react-use-clipboard";

// const App = () => {
//   const [textToCopy, setTextToCopy] = useState("");
//   const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
//   const [error, setError] = useState(null);

//   // Configure speech recognition with callbacks
//   const commands = [];
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition({
//     commands,
//     transcribing: true,
//     clearTranscriptOnListen: false,
//     onResult: (result) => {
//       console.log("Speech result:", result);
//     },
//     onError: (error) => {
//       console.error("Speech recognition error:", error);
//       setError(error.message);
//     }
//   });

//   // Initialize speech recognition
//   useEffect(() => {
//     // Create and configure speech recognition
//     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = 'en-US';

//     // Add event listeners
//     recognition.onstart = () => console.log("Speech recognition started");
//     recognition.onend = () => console.log("Speech recognition ended");
//     recognition.onerror = (event) => {
//       console.error("Speech recognition error:", event.error);
//       setError(event.error);
//     };
//     recognition.onresult = (event) => {
//       console.log("Speech recognition result:", event);
//     };

//     // Cleanup
//     return () => {
//       recognition.abort();
//     };
//   }, []);

//   const startListening = useCallback(async () => {
//     try {
//       setError(null);
//       await navigator.mediaDevices.getUserMedia({ audio: true });
      
//       await SpeechRecognition.startListening({ 
//         continuous: true,
//         language: 'en-US',
//       });
      
//       console.log("Speech recognition started successfully");
//     } catch (err) {
//       console.error("Error starting speech recognition:", err);
//       setError(err.message);
//     }
//   }, []);

//   const stopListening = useCallback(() => {
//     SpeechRecognition.stopListening();
//     console.log("Speech recognition stopped");
//   }, []);

//   if (!browserSupportsSpeechRecognition) {
//     return <div className="p-4 text-red-600">
//       Browser doesn't support speech recognition. Please use Chrome.
//     </div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
//       <h1 className="text-3xl font-bold text-blue-600 mb-6">ClassNotesAI</h1>
      
//       {/* Status and Error Display */}
//       <div className="mb-4 w-full max-w-3xl">
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center">
//             <span className={`inline-block w-3 h-3 rounded-full mr-2 ${listening ? 'bg-green-500' : 'bg-red-500'}`}></span>
//             <span className="text-gray-700">
//               Status: {listening ? 'Listening' : 'Not listening'}
//             </span>
//           </div>
//           {error && (
//             <div className="text-red-500">
//               Error: {error}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Debug Info */}
//       <div className="w-full max-w-3xl bg-gray-200 p-4 rounded mb-4 text-sm">
//         <p>Browser Support: ✅</p>
//         <p>Listening State: {listening ? '✅' : '❌'}</p>
//         <p>Transcript Length: {transcript?.length || 0} characters</p>
//       </div>

//       {/* Transcript Display */}
//       <div
//         className="w-full max-w-3xl bg-white p-4 rounded shadow-md mb-4 min-h-[100px] text-gray-800 border border-gray-300"
//         onClick={() => setTextToCopy(transcript)}
//       >
//         {transcript || "Your speech will appear here..."}
//       </div>

//       <div className="flex gap-4">
//         <button
//           className={`px-4 py-2 ${listening ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white rounded shadow transition`}
//           onClick={startListening}
//           disabled={listening}
//         >
//           Start Listening
//         </button>

//         <button
//           className={`px-4 py-2 ${!listening ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded shadow transition`}
//           onClick={stopListening}
//           disabled={!listening}
//         >
//           Stop Listening
//         </button>

//         <button
//           className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
//           onClick={setCopied}
//         >
//           {isCopied ? "Copied!" : "Copy to Clipboard"}
//         </button>

//         <button
//           className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600 transition"
//           onClick={resetTranscript}
//         >
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// };

// export default App;









import React, { useState, useEffect, useRef } from 'react';
import useClipboard from 'react-use-clipboard';

const App = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [autoRestart, setAutoRestart] = useState(true);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const manuallyStoppedRef = useRef(false);
  const [textToCopy, setTextToCopy] = useState('');
  const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });

  const cleanupMediaStream = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log('Stopped media track:', track.kind);
      });
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const initializeRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        if (manuallyStoppedRef.current) {
          cleanupMediaStream();
        } else if (autoRestart && !manuallyStoppedRef.current) {
          console.log('Auto-restarting speech recognition...');
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error('Error auto-restarting:', e);
            }
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            if (autoRestart && !manuallyStoppedRef.current) {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                console.error('Error restarting after no-speech:', e);
              }
            }
            break;
          case 'audio-capture':
            setError('No microphone was found or microphone is disabled.');
            cleanupMediaStream();
            break;
          case 'not-allowed':
            setError('Microphone permission was denied. Please allow microphone access.');
            cleanupMediaStream();
            break;
          default:
            setError(`Error: ${event.error}`);
            cleanupMediaStream();
        }
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          console.log('Transcribed:', finalTranscript);
        }
      };
    };

    initializeRecognition();

    return () => {
      if (recognitionRef.current) {
        manuallyStoppedRef.current = true;
        recognitionRef.current.stop();
        cleanupMediaStream();
      }
    };
  }, [autoRestart]);

  const startListening = async () => {
    try {
      manuallyStoppedRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(`Microphone error: ${err.message}`);
      cleanupMediaStream();
    }
  };

  const stopListening = () => {
    manuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      cleanupMediaStream();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  // Component return remains the same...
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">ClassNotesAI</h1>

      {/* Microphone Level Indicator */}
      <div className="w-full max-w-3xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-gray-700">
              {isListening ? 'Listening...' : 'Not listening'}
            </span>
          </div>
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Auto-Restart Toggle */}
      <div className="w-full max-w-3xl mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRestart}
            onChange={(e) => setAutoRestart(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Auto-restart when no speech is detected</span>
        </label>
      </div>

      {/* Transcript Display */}
      <div 
        className="w-full max-w-3xl bg-white p-4 rounded shadow-md mb-4 min-h-[200px] text-gray-800 border border-gray-300"
        onClick={() => setTextToCopy(transcript)}
      >
        {transcript || "Your speech will appear here..."}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 ${isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded shadow transition`}
          onClick={startListening}
          disabled={isListening}
        >
          Start Listening
        </button>

        <button
          className={`px-4 py-2 ${!isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white rounded shadow transition`}
          onClick={stopListening}
          disabled={!isListening}
        >
          Stop Listening
        </button>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          onClick={setCopied}
        >
          {isCopied ? "Copied!" : "Copy to Clipboard"}
        </button>

        <button
          className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600 transition"
          onClick={resetTranscript}
        >
          Reset
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-8 w-full max-w-3xl p-4 bg-gray-200 rounded text-sm">
        <h2 className="font-bold mb-2">Troubleshooting Tips:</h2>
        <ul className="list-disc pl-4">
          <li>Speak clearly and at a normal volume</li>
          <li>Make sure you're in a quiet environment</li>
          <li>Keep your microphone close to your mouth</li>
          <li>Try toggling the auto-restart option if recognition stops frequently</li>
        </ul>
      </div>
    </div>
  );
};

export default App;