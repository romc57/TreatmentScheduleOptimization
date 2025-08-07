// Common button styles
export const buttonStyle = (isActive, lightMode) => ({
  padding: '0.5rem 1rem',
  background: isActive 
    ? (lightMode ? '#009688' : '#b71c1c') 
    : (lightMode ? '#e3e3e3' : '#e3e3e3'),
  color: isActive 
    ? '#fff' 
    : (lightMode ? '#009688' : '#222'),
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
});

export const actionButtonStyle = (lightMode) => ({
  background: lightMode ? '#009688' : '#b71c1c',
  color: '#fff',
  border: '2px solid',
  borderColor: lightMode ? '#009688' : '#b71c1c',
  borderRadius: '6px',
  padding: '0.5rem 1.2rem',
  cursor: 'pointer',
  fontWeight: 600,
});

export const themeButtonStyle = (lightMode) => ({
  background: lightMode ? '#222' : '#fff',
  color: lightMode ? '#fff' : '#b71c1c',
  border: '2px solid #b71c1c',
  borderRadius: '6px',
  padding: '0.4rem 1.2rem',
  fontWeight: 600,
  cursor: 'pointer',
});
