import { useState, useEffect } from 'react';

interface ApiStatusResponse {
  service: string;
  status: string;
  environment: string;
  region: string;
  database: {
    connected: boolean;
    mode: string;
    configuredUri: string;
  };
  uptimeSeconds: number;
  timestamp: string;
}

function App() {
  const [statusData, setStatusData] = useState<ApiStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // 1. Initial load effect: async function inside useEffect + ignore flag
  useEffect(() => {
    let ignore = false;

    async function loadInitialStatus() {
      try {
        const response = await fetch(`${apiUrl}/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: ApiStatusResponse = await response.json();
        if (!ignore) {
          setStatusData(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialStatus();

    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  // 2. Manual button click handler (event handlers are allowed to call setState synchronously)
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: ApiStatusResponse = await response.json();
      setStatusData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">AWS Full-Stack Monitor</h1>
            <p className="text-xs text-slate-400 mt-1">Target: {apiUrl}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition cursor-pointer"
          >
            {loading ? 'Pinging...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-lg text-sm">
            <p className="font-semibold">Connection Failed</p>
            <p className="mt-1 text-xs">{error} — Make sure your Express API is running on port 3001.</p>
          </div>
        )}

        {statusData && !error && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Service Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-emerald-400 capitalize">{statusData.status}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Environment / Region</span>
                <p className="mt-1 font-mono text-sm text-slate-200">
                  {statusData.environment} ({statusData.region})
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Raw API Payload</span>
              <pre className="mt-2 text-xs text-indigo-300 font-mono overflow-x-auto">
                {JSON.stringify(statusData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
