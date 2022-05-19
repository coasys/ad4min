import Header from './components/Header';
import Login from './components/Login';
import './App.css';
import { useContext, useState } from 'react';
import { Button, Loader, Stack, TextInput } from '@mantine/core';
import TrustAgent from './components/TrustAgent';
import Navigation from './components/Navigation';
import { Ad4minContext } from './context/Ad4minContext';
import { AgentContext, AgentProvider } from './context/AgentContext';
import { buildAd4mClient } from './util';
import { showNotification } from '@mantine/notifications';

import { appWindow } from '@tauri-apps/api/window'
appWindow.listen('tauri://close-requested', ({ event, payload }) => {
  appWindow.hide()
})

const App = () => {
  const {state: {
    connected, isUnlocked, candidate, connectedLaoding, did
  }, methods: {
    handleTrustAgent,
    configureEndpoint
  }} = useContext(Ad4minContext);

  const [url, setURL] = useState("");
  const [urlError, setURLError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const { value } = event.target;
    setURL(value);
  }

  const onInitialize = async () => {
    setLoading(true);
    
    return new Promise(async (resolve, reject) => {      
      if (!url) {
        setURLError('URL is required')
      } else if (!/^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-zA-Z]+):([0-9]{1,5})(?:\/[a-zA-Z]{0,100})$/.test(url)) {
        setURLError('Invalid websocket URL')
      } else {
        try {
          const client = buildAd4mClient(url!)

          const id = setTimeout(() => {
            resolve(true)

            showNotification({
              color: 'red',
              message: 'Failed to connect to the endpoint provided'
            });

            setLoading(false)
          }, 2000)
          
          await client.runtime.hcAgentInfos();
  
          clearTimeout(id)
          
          configureEndpoint(url);

          resolve(true);
        } catch(e) {
          showNotification({
            color: 'red',
            message: 'Failed to connect to the endpoint provided'
          })

          reject()
        } finally {
          setLoading(false)
        }
      }
      setLoading(false);
      resolve(true)
    })
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
                  placeholder='ws://www.example.com/graphql' 
                  radius="md" 
                  size="md" 
                  onChange={onUrlChange}
                  required
                  error={urlError}
                />
                <Button onClick={onInitialize} loading={loading}>
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
          <AgentProvider>
            <Login />
          </AgentProvider>
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
