import React from 'react';
import { Global, css } from '@emotion/react';
import AppLayout from './components/layout/AppLayout';
import TokenForm from './components/TokenForm/TokenForm';
import PRList from './components/PRList/PRList';
import StatusMessage from './components/ui/StatusMessage';
import SvgIcon from './components/ui/SvgIcon';
import useGitHubData from './hooks/use-github-data.hook';

// Logo SVG
const HOCKEY_LOGO_SVG = `
  <svg width="40" height="40" viewBox="0 0 288 288" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_1273_744)">
  <circle cx="97.314" cy="197.728" r="33.8762" transform="rotate(161.226 97.314 197.728)" fill="white"/>
  <circle cx="172.397" cy="143.659" r="33.8762" transform="rotate(179.769 172.397 143.659)" fill="white"/>
  <circle cx="105.92" cy="85.9523" r="43.5452" transform="rotate(-173.121 105.92 85.9523)" fill="white"/>
  <circle cx="229.674" cy="193.104" r="31" transform="rotate(179.769 229.674 193.104)" fill="white"/>
  <rect x="114.76" y="155.862" width="29.3092" height="72.3571" rx="14.6546" transform="rotate(-173.121 114.76 155.862)" fill="white"/>
  </g>
  <defs>
  <clipPath id="clip0_1273_744">
  <rect width="288" height="288" fill="white"/>
  </clipPath>
  </defs>
  </svg>
`;

// Estilos globales
const globalStyles = css`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #121212;
    color: #ffffff;
    line-height: 1.5;
    overflow: hidden;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: #424242;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
  
  /* Ocultar los botones de macOS */
  .titlebar-stoplight,
  .traffic-light-close,
  .traffic-light-minimize,
  .traffic-light-maximize,
  .toolbar-buttons,
  .titlebar-button,
  .titlebar-button-custom,
  .close,
  .minimize,
  .maximize {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }
  
  /* Alternativamente, hacerlos negros */
  :root {
    --traffic-light-close-active-bg: #000000 !important;
    --traffic-light-close-active-color: #000000 !important;
    --traffic-light-close-bg: #000000 !important;
    --traffic-light-close-color: #000000 !important;
    --traffic-light-maximize-active-bg: #000000 !important;
    --traffic-light-maximize-active-color: #000000 !important;
    --traffic-light-maximize-bg: #000000 !important;
    --traffic-light-maximize-color: #000000 !important;
    --traffic-light-minimize-active-bg: #000000 !important;
    --traffic-light-minimize-active-color: #000000 !important;
    --traffic-light-minimize-bg: #000000 !important;
    --traffic-light-minimize-color: #000000 !important;
  }
`;

const Hockey: React.FC = () => {
  const {
    token,
    setToken,
    status,
    loading,
    pullRequests,
    tokenSaved,
    error,
    showTokenForm,
    setShowTokenForm,
    handleSubmit,
    handleDeleteToken,
    handlePRClick,
    handleGenerateTokenClick,
    loadPullRequests
  } = useGitHubData();

  const logo = (
    <SvgIcon 
      svgContent={HOCKEY_LOGO_SVG} 
      style={{ color: 'white', width: '48px', height: '48px', marginRight: '-5px' }}
    />
  );

  // Manejar directamente el toggle del formulario
  const toggleTokenForm = () => {
    setShowTokenForm(!showTokenForm);
  };

  const footerButton = (
    <button 
      onClick={toggleTokenForm}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        padding: 0,
        opacity: 0.6
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.2475 9.40789 21.3073 9.30769 21.3292 9.19646C21.351 9.08523 21.3337 8.96986 21.28 8.87L19.36 5.55C19.3032 5.44985 19.2129 5.37291 19.105 5.33268C18.9972 5.29245 18.8785 5.2915 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.3823 2.69553 14.3241 2.5912 14.2361 2.51597C14.148 2.44074 14.0359 2.39959 13.92 2.4H10.08C9.84003 2.4 9.65002 2.57 9.61002 2.81L9.25003 5.35C8.66003 5.59 8.12003 5.92 7.63003 6.29L5.24003 5.33C5.02003 5.25 4.77003 5.33 4.65003 5.55L2.74003 8.87C2.62003 9.08 2.66003 9.34 2.86003 9.48L4.89003 11.06C4.84003 11.36 4.80003 11.69 4.80003 12C4.80003 12.31 4.82003 12.64 4.87003 12.94L2.84003 14.52C2.75255 14.5921 2.69278 14.6923 2.6709 14.8035C2.64902 14.9148 2.66638 15.0301 2.72003 15.13L4.64003 18.45C4.76003 18.67 5.01003 18.74 5.23003 18.67L7.62003 17.71C8.12003 18.09 8.65003 18.41 9.24003 18.65L9.60003 21.19C9.65003 21.43 9.84003 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.40002 13.98 8.40002 12C8.40002 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="white"/>
      </svg>
    </button>
  );

  return (
    <>
      <Global styles={globalStyles} />
      <AppLayout logo={logo} footer={footerButton}>
        <StatusMessage>{status}</StatusMessage>
        
        {showTokenForm && (
          <TokenForm
            token={token}
            onTokenChange={setToken}
            onSubmit={handleSubmit}
            onGenerateToken={handleGenerateTokenClick}
            onDeleteToken={handleDeleteToken}
          />
        )}
        
        {tokenSaved && !showTokenForm && (
          <PRList
            pullRequests={pullRequests}
            loading={loading}
            onRefresh={() => loadPullRequests(token)}
            onPRClick={handlePRClick}
            error={error}
          />
        )}
      </AppLayout>
    </>
  );
};

export default Hockey; 