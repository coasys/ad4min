import Header from './components/Header';
import Login from './components/Login';
import './App.css';
import { useContext, useState } from 'react';
import { Button, Loader, Stack, TextInput } from '@mantine/core';
import TrustAgent from './components/TrustAgent';
import Navigation from './components/Navigation';
import { Ad4minContext } from './context/Ad4minContext';

const App = () => {
  const {state: {
    connected, isUnlocked, candidate, connectedLaoding, did
  }, methods: {
    handleTrustAgent,
    setUrl
  }} = useContext(Ad4minContext);

  const [url, setURL] = useState("");
  const [urlError, setURLError] = useState<string | null>(null);

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const { value } = event.target;
    setURL(value);
  }

  const onInitialize = () => {
    if (!url) {
      setURLError('URL is required')
    } else if (!/^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-zA-Z]+):([0-9]{1,5})(?:\/[a-zA-Z]{0,100})$/.test(url)) {
      setURLError('Invalid websocket URL')
    } else {
      setUrl(url);
    }
  }

  return (
    <div className="App">
      {!connected && (
        <Stack align="center" spacing="xl" style={{margin: "auto"}}>
          <Header />
          {connectedLaoding ? (
              <Loader />
            ) : (
              <>
                <TextInput 
                  label="Ad4m URL" 
                  placeholder='https://www.example.com' 
                  radius="md" 
                  size="md" 
                  onChange={onUrlChange}
                  required
                  error={urlError}
                />
                <Button onClick={onInitialize}>
                  Initialize Client
                </Button>
              </>
            )
          }
        </Stack>
      )}
      {connected && !isUnlocked && (
        <Stack align="center" spacing="xl" style={{margin: "auto"}}>
          <Header />
          <Login />
        </Stack>
      )}
      {/* {isLogined && <Profile did={did} />} */}
      {/* {isLogined && <Language />} */}
      {isUnlocked && <Navigation did={did} />}
      {candidate && <TrustAgent candidate={candidate} handleTrustAgent={handleTrustAgent} />}
    </div>
  );
}

export default App;
