import Header from './components/Header';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Ad4mClient, LanguageHandle, ExceptionType } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import 'react-toastify/dist/ReactToastify.css';
import { ExceptionInfo } from '@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver';
import { Button, Group, Modal, TextInput, Space, Notification as NotifyWeb } from '@mantine/core';
import { Check } from 'tabler-icons-react';


const AD4M_ENDPOINT = "ws://localhost:4000/graphql";

const App = () => {

  const [isInitialized, setIsInitialized] = useState<Boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<Boolean | null>(null);
  const [password, setPassword] = useState("");
  const [did, setDid] = useState("");
  const [languageAddr, setLanguageAddr] = useState("");
  const [language, setLanguage] = useState<LanguageHandle | null>(null);
  const [trustCandidate, setTrustCandidate] = useState("");
  const [opened, setOpened] = useState(false);
  const [success, setSuccess] = useState(false);

  let ad4mClient = buildAd4mClient(AD4M_ENDPOINT);

  useEffect(() => {
    const checkIfAgentIsInitialized = async () => {
      let status = await buildAd4mClient(AD4M_ENDPOINT).agent.status();
      console.log("agent status in init: ", status);

      setIsInitialized(status.isInitialized);
      setIsUnlocked(status.isUnlocked);
      setDid(status.did!);
    };
    checkIfAgentIsInitialized();
  }, []);

  // TODO generate agent if agent is not initialized
  const generateAgent = async (event: React.SyntheticEvent) => {
    let agentStatus = await ad4mClient.agent.generate(password);
    setIsInitialized(agentStatus.isInitialized);
    setIsUnlocked(agentStatus.isUnlocked);
    setDid(agentStatus.did!);
    console.log("agent status in generate: ", agentStatus);
  };

  const unlockAgent = async (event: React.SyntheticEvent) => {
    let agentStatus = await ad4mClient.agent.unlock(password);
    setIsUnlocked(agentStatus.isUnlocked);
    console.log("agent status in unlock: ", agentStatus);
  }

  const addTrustedAgent = async (event: React.SyntheticEvent) => {
    let agents = await ad4mClient.runtime.addTrustedAgents([trustCandidate]);
    setOpened(false);
    setSuccess(true);
    console.log("agent is now trusted: ", agents);
  }

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  const subscribeError = () => {
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
  };

  const renderNotInitializedContainer = () => (
    <button onClick={generateAgent}>
      Generate agent
    </button>
  );

  const renderNotUnlockedContainer = () => (
    <button onClick={unlockAgent}>
      Unlock agent
    </button>
  );

  const renderDidContainer = () => (
    <div>
      <p>{did}</p>
    </div>
  );

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
      <input type="text" placeholder="Input language address" value={languageAddr} onChange={onLanguageAddrChange} />
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

  return (
    <div className="App">
      <Header />
      {!isUnlocked && <input type="text" placeholder="Input password" value={password} onChange={onPasswordChange} />}
      {!isInitialized && renderNotInitializedContainer()}
      {isInitialized && !isUnlocked && renderNotUnlockedContainer()}
      {isUnlocked && renderDidContainer()}
      {isUnlocked && renderGetLanguageContainer()}
      {language && renderLanguageContainer()}
      {opened && renderTrustAgentModal()}
      {success && (
        <NotifyWeb icon={<Check size={20} />}>
          Agent is trusted now.
        </NotifyWeb>
      )}
      <Button onClick={subscribeError}>
        Subscribe Error
      </Button>
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
