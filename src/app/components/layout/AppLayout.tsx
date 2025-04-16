import styled from '@emotion/styled';
import React from 'react';

export const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(26, 26, 26);
  color: white;
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.38);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

export const TitleBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(20, 20, 20, 0.3);
  padding: 8px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-app-region: drag;
  z-index: 100;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  
  & .traffic-lights,
  & .titlebar-stoplight,
  & [role="toolbar"],
  & [role="button"],
  & [class*="title"],
  & [class*="traffic"],
  & [class*="close"],
  & [class*="minimize"],
  & [class*="maximize"] {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }
`;

export const ContentArea = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  margin-top: 64px; /* Aumentar el margen superior para acomodar la TitleBar más grande */
`;

export const FooterBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 38px;
  background: rgba(20, 20, 20, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  user-select: none;
  z-index: 10;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  padding-bottom: 8px;
`;

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = "HockeyPR", 
  logo, 
  footer = "Made with ⚡ by @Felipeinf" 
}) => {
  return (
    <AppContainer style={{ background: 'rgba(26, 26, 26, 0.8)' }}>
      <TitleBar>
        <h1 style={{ 
          margin: 0, 
          fontSize: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0,
          marginLeft: '-8px',
        }}>
          {logo} 
          {title}
        </h1>
      </TitleBar>
      
      <ContentArea>
        {children}
      </ContentArea>
      
      <FooterBar>
        {typeof footer === 'string' ? null : footer}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}><a onClick={(e) => { e.preventDefault(); window.electron?.openExternal?.("https://github.com/Felipeinf"); }} style={{ color: "white", textDecoration: "none", fontSize: "10px", marginBottom: "0px", opacity: 0.8, cursor: "pointer" }}><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.7918 2.69666e-09C8.2293 -5.7257e-05 5.75037 0.911761 3.79864 2.57228C1.84692 4.23281 0.549777 6.53366 0.139344 9.06311C-0.271089 11.5926 0.231971 14.1855 1.5585 16.378C2.88504 18.5704 4.94846 20.2193 7.37954 21.0295C7.91912 21.1245 8.12092 20.8007 8.12092 20.5169C8.12092 20.2612 8.10797 19.4108 8.10797 18.5075C5.39605 19.0061 4.6946 17.846 4.47876 17.2395C4.23919 16.649 3.85956 16.1257 3.37263 15.7147C2.99492 15.5129 2.45535 15.0132 3.3586 15.0003C3.70383 15.0375 4.03497 15.1576 4.32391 15.3501C4.61285 15.5427 4.85107 15.8021 5.01834 16.1064C5.1659 16.3715 5.36432 16.6049 5.60224 16.7932C5.84015 16.9815 6.11289 17.121 6.40482 17.2038C6.69675 17.2865 7.00213 17.3107 7.30347 17.2752C7.6048 17.2397 7.89616 17.145 8.16085 16.9967C8.2072 16.4477 8.45196 15.9344 8.84935 15.5528C6.44822 15.283 3.93919 14.3528 3.93919 10.225C3.92477 9.15246 4.32043 8.11487 5.04532 7.32424C4.71609 6.39198 4.75468 5.36927 5.15324 4.46447C5.15324 4.46447 6.05649 4.18173 8.12092 5.57061C9.88675 5.08509 11.7509 5.08509 13.5167 5.57061C15.58 4.1677 16.4844 4.46447 16.4844 4.46447C16.8829 5.36927 16.9215 6.39198 16.5923 7.32424C17.32 8.11311 17.7162 9.15187 17.6984 10.225C17.6984 14.3657 15.1754 15.283 12.7753 15.5528C13.0326 15.814 13.2306 16.1275 13.3561 16.4719C13.4816 16.8164 13.5316 17.1838 13.5027 17.5492C13.5027 18.9932 13.4897 20.1532 13.4897 20.5169C13.4897 20.8007 13.6915 21.1374 14.2311 21.0295C16.6577 20.2125 18.715 18.5597 20.0357 16.3662C21.3564 14.1727 21.8546 11.5812 21.4414 9.05432C21.0281 6.52745 19.7303 4.22968 17.7796 2.57118C15.8289 0.912675 13.3523 0.00139218 10.7918 2.69666e-09Z" fill="white"/></svg></a><span>Made with ⚡ by felipeinf</span></div>
      </FooterBar>
    </AppContainer>
  );
};

export default AppLayout; 