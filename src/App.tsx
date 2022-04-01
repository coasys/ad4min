import Header from './components/Header';
import Login from './components/Login';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Ad4mClient, LanguageHandle, ExceptionType } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { ExceptionInfo } from '@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver';
import { Button, Group, Modal, TextInput, Space, Loader, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

const AD4M_ENDPOINT = "ws://localhost:4000/graphql";

const App = () => {

  const [isInitialized, setIsInitialized] = useState<Boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<Boolean | null>(null);
  const [did, setDid] = useState("");
  const [languageAddr, setLanguageAddr] = useState("");
  const [language, setLanguage] = useState<LanguageHandle | null>(null);
  const [trustCandidate, setTrustCandidate] = useState("");
  const [opened, setOpened] = useState(false);
  const [connected, setConnected] = useState(false);

  let ad4mClient = buildAd4mClient(AD4M_ENDPOINT);

  useEffect(() => {
    const checkIfAgentIsInitialized = async () => {
      let ad4mClient = buildAd4mClient(AD4M_ENDPOINT);
      let status = await ad4mClient.agent.status();
      console.log("agent status in init: ", status);

      setIsInitialized(status.isInitialized);
      setIsUnlocked(status.isUnlocked);
      setDid(status.did!);
      setConnected(true);

      if (status.isInitialized) {
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
    };
    checkIfAgentIsInitialized();
  }, []);

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

  const handleLogin = (isUnlocked: Boolean) => {
    setIsUnlocked(isUnlocked);

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

  return (
    <div className="App">
      <Stack align="center" spacing="xl">
        <Header />
        {!connected && <Loader />}
        {connected && !isUnlocked && <Login ad4mClient={ad4mClient} isInitialized={isInitialized} isUnlocked={isUnlocked} handleLogin={handleLogin} />}
        {isUnlocked && <p>{did}</p>}
        {isUnlocked && renderGetLanguageContainer()}
        {language && renderLanguageContainer()}
        {opened && renderTrustAgentModal()}
      </Stack>
    </div>
  );
}

export function buildAd4mClient(server: string): Ad4mClient {
  let apolloClient = new ApolloClient({
    link: new WebSocketLink({
      uri: server,
      options: { reconnect: true },
      webSocketImpl: WebSocket,
    }),
    cache: new InMemoryCache({ resultCaching: false, addTypename: false }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
      },
      query: {
        fetchPolicy: "no-cache",
      }
    },
  });

  //@ts-ignore
  return new Ad4mClient(apolloClient);
}

export default App;
