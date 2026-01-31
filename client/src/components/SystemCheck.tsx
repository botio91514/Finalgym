import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../App';
import { toast } from 'react-hot-toast';

interface SystemStatus {
  api: boolean;
  auth: boolean;
  database: boolean;
}

const SystemCheck: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    api: false,
    auth: false,
    database: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        setLoading(true);
        
        // Check API and database
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();

        // Check authentication
        const token = localStorage.getItem('token');
        let authStatus = false;

        if (token) {
          try {
            const authResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            authStatus = authResponse.ok;
          } catch (error) {
            console.error('Auth check failed:', error);
          }
        }

        setStatus({
          api: healthResponse.ok,
          database: healthData.checks.database,
          auth: authStatus
        });

      } catch (error) {
        console.error('System check failed:', error);
        toast.error('System check failed');
      } finally {
        setLoading(false);
      }
    };

    checkSystem();
    // Run check every 5 minutes
    const interval = setInterval(checkSystem, 300000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <p>Checking system status...</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">System Status</h3>
      <ul className="space-y-2">
        <li className={`flex items-center ${status.api ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{status.api ? '✓' : '✗'}</span>
          API Connection
        </li>
        <li className={`flex items-center ${status.database ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{status.database ? '✓' : '✗'}</span>
          Database
        </li>
        <li className={`flex items-center ${status.auth ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{status.auth ? '✓' : '✗'}</span>
          Authentication
        </li>
      </ul>
    </div>
  );
};

export default SystemCheck; 