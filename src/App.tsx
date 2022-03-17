import Header from './components/Header';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Ad4mClient, LanguageHandle } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

const AD4M_ENDPOINT = "ws://localhost:4000/graphql";

const App = () => {

  const [isInitialized, setIsInitialized] = useState<Boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<Boolean | null>(null);
  const [password, setPassword] = useState("");
  const [did, setDid] = useState("");
  const [languageAddr, setLanguageAddr] = useState("");
  const [language, setLanguage] = useState<LanguageHandle | null>(null);
  const [error, setError] = useState("");

  let ad4mClient = buildAd4mClient(AD4M_ENDPOINT);

  useEffect(() => {
    window.addEventListener('load', async () => {
      await checkIfAgentIsInitialized();
    });
  });

  const checkIfAgentIsInitialized = async () => {
    let status = await ad4mClient.agent.status();
    console.log("agent status in init: ", status);

    setIsInitialized(status.isInitialized);
    setIsUnlocked(status.isUnlocked);
    setDid(status.did!);
  };

  // TODO generate agent if agent is not initialized
  const generateAgent = async () => {
  };

  const unlockAgent = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    let status = await ad4mClient.agent.unlock(password);
    console.log("agent status in unlock: ", status);
  }

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  const renderNotInitializedContainer = () => (
    <button onClick={generateAgent}>
      Generate agent
    </button>
  );

  const renderNotUnlockedContainer = () => (
    <div>
      <form onSubmit={unlockAgent}>
        <input type="text" placeholder="Input password" value={password} onChange={onPasswordChange} />
        <button type='submit'>
          Unlock agent
        </button>
      </form>
    </div>
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
      if (err instanceof Error) {
        setError(err.message);
      }
      alert(err);
    }

  };

  const onLanguageAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setLanguageAddr(value);
  }

  const renderGetLanguageContainer = () => (
    <div>
      <form onSubmit={getLanguage}>
        <input type="text" placeholder="Input language address" value={languageAddr} onChange={onLanguageAddrChange} />
        <button type='submit'>
          Get Language
        </button>
      </form>
    </div>
  );

  const renderLanguageContainer = () => (
    <div>
      <p>Name: {language?.name}</p>
      <p>Address: {language?.address}</p>
    </div>
  )

  const renderErrorContainer = () => (
    <div>
      Error: {error}
    </div>
  )

  return (
    <div className="App">
      <Header />
      {!isInitialized && renderNotInitializedContainer()}
      {!isUnlocked && renderNotUnlockedContainer()}
      {isUnlocked && renderDidContainer()}
      {isUnlocked && renderGetLanguageContainer()}
      {language && renderLanguageContainer()}
      {error && renderErrorContainer()}
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
