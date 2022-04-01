import Header from './components/Header';
import Login from './components/Login';
import './App.css';
import React, { useContext, useEffect, useState } from 'react';
import { LanguageHandle, ExceptionType } from '@perspect3vism/ad4m';
import { ExceptionInfo } from '@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver';
import { Button, Group, Modal, TextInput, Space, Loader, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Ad4mContext } from '.';

const App = () => {

  const ad4mClient = useContext(Ad4mContext);
  const [languageAddr, setLanguageAddr] = useState("");
  const [language, setLanguage] = useState<LanguageHandle | null>(null);
  const [trustCandidate, setTrustCandidate] = useState("");
  const [opened, setOpened] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isLogined, setIsLogined] = useState<Boolean>(false);
  const [did, setDid] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await ad4mClient.runtime.hcAgentInfos(); // TODO runtime info is broken
        console.log("get hc agent infos success.");
        setConnected(true);
      } catch(err) {
        setConnected(false);
      }
    }
    
    checkConnection();
    
    console.log("Check if ad4m service is connected.")
  }, [ad4mClient]);

  const addTrustedAgent = async (event: React.SyntheticEvent) => {
    let agents = await ad4mClient.runtime.addTrustedAgents([trustCandidate]);
    setOpened(false);
    showNotification({
      message: 'Great, the agent is trusted now! 🤥',
    })
    console.log("agent is now trusted: ", agents);
  }

  const getLanguage = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    try {
      let language = await ad4mClient.languages.byAddress(languageAddr);
      console.log("language get result, ", language);
      setLanguage(language);
    } catch (err) {
      console.log(err);
    }
  };

  const onLanguageAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setLanguageAddr(value);
  }

  const renderGetLanguageContainer = () => (
    <div>
      <TextInput type="text" placeholder="Input language address" value={languageAddr} onChange={onLanguageAddrChange} />
      <Button onClick={getLanguage}>
        Get Language
      </Button>
    </div>
  );

  const renderLanguageContainer = () => (
    <div>
      <p>Name: {language?.name}</p>
      <p>Address: {language?.address}</p>
    </div>
  )

  const renderTrustAgentModal = () => (
    <div>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Trust Agent"
      >
        <TextInput
          defaultValue={trustCandidate}
          label="Agent DID"
        />
        <Group>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Close
          </Button>
          <Space h="md" />
          <Button onClick={addTrustedAgent}>
            Trust Agent
          </Button>
        </Group>

      </Modal>
    </div>
  )

  const handleLogin = (login: Boolean, did: string) => {
    setIsLogined(login);
    setDid(did);

    if(login) {
      ad4mClient.runtime.addExceptionCallback((exception: ExceptionInfo) => {
        if (exception.type === ExceptionType.AgentIsUntrusted) {
          setTrustCandidate(exception.addon!);
          setOpened(true);
        }
        Notification.requestPermission()
          .then(response => {
            if (response === 'granted') {
              new Notification(exception.title, { body: exception.message })
            }
          });
        console.log(exception);
        return null
      })
    }
  }

  return (
    <div className="App">
      <Stack align="center" spacing="xl">
        <Header />
        {!connected && <Loader />}
        {connected && !isLogined && <Login handleLogin={handleLogin} />}
        {isLogined && <p>{did}</p>}
        {isLogined && renderGetLanguageContainer()}
        {language && renderLanguageContainer()}
        {opened && renderTrustAgentModal()}
      </Stack>
    </div>
  );
}



export default App;
