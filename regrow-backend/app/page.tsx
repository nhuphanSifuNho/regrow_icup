export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        Regrow Backend API
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        Backend server is running successfully
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>
          Available API Endpoints:
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, color: '#555' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET</strong> /api/costs/[zoneId]
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET</strong> /api/damage/[zoneId]
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET</strong> /api/damage/nearby
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET</strong> /api/damage/updates
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET</strong> /api/donations/[donationId]
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET</strong> /api/tracking
          </li>
        </ul>
      </div>
    </div>
  );
}
