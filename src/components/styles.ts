export const MainContainer = {
  with: 'calc(100vw - 284px)', 
  width: '100%',
  height: '100vh',
  position: 'relative' as 'relative',
  padding: 0,
  overflowX: 'clip' as 'clip'
}

export const MainHeader = {
  width: 'calc(100% - 341px)',
  marginLeft: 301,
  position: 'fixed' as 'fixed',
  background: '#fff',
  zIndex: 98,
  top: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  padding: `20px`,
}

export const RouteContainer = { 
  width: 'calc(100% - 301px)', 
  marginLeft: 301,
  overflowX: 'hidden' as 'hidden'
}