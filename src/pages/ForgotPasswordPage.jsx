// src/pages/ForgotPasswordPage.jsx
// Página principal de recuperación de contraseña

import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

function ForgotPasswordPage() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.content}>
        {/* Formulario de recuperación */}
        <ForgotPasswordForm />

        {/* Navegación */}
        <div style={styles.navigation}>
          <button
            onClick={() => {
              // Scroll hacia arriba donde está el login
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={styles.linkButton}
          >
            ← Volver al Login
          </button>
          <button
            onClick={() => {
              // Scroll hacia registro
              const registerSection = document.querySelector('h2')
              if (
                registerSection &&
                registerSection.textContent.includes('Crear Cuenta')
              ) {
                registerSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            style={styles.linkButton}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>

        {/* Información adicional */}
        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>💡 ¿Necesitas ayuda?</h3>
          <div style={styles.helpContent}>
            <p style={styles.helpText}>
              <strong>Si no recibes el email:</strong>
            </p>
            <ul style={styles.helpList}>
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que hayas escrito correctamente tu email</li>
              <li>El email puede tardar hasta 5 minutos en llegar</li>
              <li>Asegúrate de tener conexión a internet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Estilos responsive y accesibles
const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
    fontFamily: 'Arial, sans-serif',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '0 20px',
  },
  link: {
    color: '#2e7d32',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
  },
  linkButton: {
    background: 'none',
    border: '1px solid transparent',
    color: '#2e7d32',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  helpSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  },
  helpTitle: {
    color: '#2e7d32',
    margin: '0 0 15px 0',
    fontSize: '1.1rem',
    textAlign: 'center',
  },
  helpContent: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  helpText: {
    margin: '0 0 10px 0',
    color: '#333',
  },
  helpList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#666',
  },
}

// Media queries para responsive
const mediaQueries = `
  @media (max-width: 768px) {
    .navigation {
      flex-direction: column;
      align-items: center;
    }
    
    .link {
      text-align: center;
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .pageContainer {
      padding: 10px;
    }
    
    .helpSection {
      padding: 15px;
    }
  }
`

// Agregar media queries al head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = mediaQueries
  document.head.appendChild(styleSheet)
}

// Agregar efectos hover con CSS-in-JS
const hoverStyles = `
  .forgot-password-link:hover {
    background-color: #e8f5e8;
    border-color: #2e7d32;
    transform: translateY(-1px);
  }
`

if (typeof document !== 'undefined') {
  const hoverStyleSheet = document.createElement('style')
  hoverStyleSheet.textContent = hoverStyles
  document.head.appendChild(hoverStyleSheet)
}

export default ForgotPasswordPage
