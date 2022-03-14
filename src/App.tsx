import Header from './components/Header';
import './App.css';
import { useEffect, useState } from 'react';
import { Ad4mClient } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

const AD4M_ENDPOINT = "ws://localhost:4000/graphql";

const App = () => {

  const [isInitialized, setIsInitialized] = useState<Boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<Boolean | null>(null);
  const [password, setPassword] = useState("");
  const [did, setDid] = useState("");

  let ad4mClient = buildAd4mClient(AD4M_ENDPOINT);

  useEffect(() => {
    window.addEventListener('load', async () => {
      await checkIfAgentIsInitialized();
    });
  }, []);

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

  const unlockAgent = async () => {
    let status = await ad4mClient.agent.unlock(password);
    console.log("agent status in unlock: ", status);
  }

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <input type="text" placeholder="Input password" value={password} onChange={onPasswordChange}/>
        <button type='submit'>
          Unlock agent
        </button>
      </form>
    </div>
  );

  const renderUnlockedContainer = () => (
    <div>
      <p>{ did }</p>
    </div>
  )

  return (
    <div className="App">
      <Header />
      {!isInitialized && renderNotInitializedContainer()}
      {!isUnlocked && renderNotUnlockedContainer()}
      {isUnlocked && renderUnlockedContainer()}
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
