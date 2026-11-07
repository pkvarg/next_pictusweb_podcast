export default function NotFound() {
  return (
    <html lang="sk">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#141511',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <p style={{ fontSize: '72px', fontWeight: 300, margin: 0, color: 'rgba(255,255,255,0.9)' }}>
          404
        </p>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 300,
            marginTop: '16px',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          Stránka sa nenašla
        </h1>
        <p style={{ marginTop: '8px', color: '#9ca3af' }}>
          Táto stránka neexistuje alebo bola presunutá.
        </p>
        <a
          href="/"
          style={{
            marginTop: '32px',
            background: '#b6e036',
            color: '#141511',
            padding: '10px 20px',
            borderRadius: '9999px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Domov
        </a>
      </body>
    </html>
  )
}
