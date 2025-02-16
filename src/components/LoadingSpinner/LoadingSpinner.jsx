import { govukColors } from '../../config/constants';

const LoadingSpinner = ({ message = 'Loading data...' }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: govukColors.white,
      zIndex: 9999
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: `4px solid ${govukColors.lightGrey}`,
        borderTop: `4px solid ${govukColors.blue}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      <p style={{
        color: govukColors.black,
        fontSize: '19px',
        fontWeight: 400,
        margin: 0,
        textAlign: 'center'
      }}>
        {message}
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner; 