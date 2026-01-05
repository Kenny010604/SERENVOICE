import { useEffect, useState } from 'react';
import secureStorage from '../../utils/secureStorage';
import authService from '../../services/authService';

const SessionDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebug = () => {
      const tokenInfo = secureStorage.getTokenInfo();
      const user = authService.getUser();
      const token = secureStorage.getAccessToken();
      
      // Check both storages
      const localData = {
        sv_access: localStorage.getItem('sv_access'),
        sv_refresh: localStorage.getItem('sv_refresh'),
        sv_persist: localStorage.getItem('sv_persist'),
        user: localStorage.getItem('user')
      };
      
      const sessionData = {
        sv_access: sessionStorage.getItem('sv_access'),
        sv_refresh: sessionStorage.getItem('sv_refresh'),
        sv_persist: sessionStorage.getItem('sv_persist'),
        user: sessionStorage.getItem('user')
      };

      setDebugInfo({
        secureStorage: tokenInfo,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        user: user ? { id: user.id_usuario, nombre: user.nombre } : null,
        localStorage: localData,
        sessionStorage: sessionData
      });
    };

    updateDebug();
    
    // Update every 2 seconds
    const interval = setInterval(updateDebug, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#5ad0d2' }}>🔍 Session Debug</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>SecureStorage Info:</strong>
        <pre style={{ margin: '5px 0', fontSize: '11px' }}>
          {JSON.stringify(debugInfo.secureStorage, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Token Status:</strong>
        <div style={{ color: debugInfo.hasToken ? '#4caf50' : '#ff3333' }}>
          {debugInfo.hasToken ? `✅ Token presente (${debugInfo.tokenLength} chars)` : '❌ Sin token'}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>User:</strong>
        <pre style={{ margin: '5px 0', fontSize: '11px' }}>
          {JSON.stringify(debugInfo.user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>localStorage:</strong>
        <pre style={{ margin: '5px 0', fontSize: '10px', color: '#ffd700' }}>
          {JSON.stringify(debugInfo.localStorage, null, 2)}
        </pre>
      </div>

      <div>
        <strong>sessionStorage:</strong>
        <pre style={{ margin: '5px 0', fontSize: '10px', color: '#87ceeb' }}>
          {JSON.stringify(debugInfo.sessionStorage, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SessionDebug;
