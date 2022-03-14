import '../styles/globals.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { createGlobalStyle, ThemeProvider } from 'styled-components';

const GlobalStyle = createGlobalStyle`

`;

const theme = {
  // colors: {
  //   primary: '#0070f3',
  // },
};

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
