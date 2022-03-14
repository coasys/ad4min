import Header from './components/Header';
import './App.css';
import { useState } from 'react';
import { Ad4mClient } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

const App = () => {

  const [isInitialized, setIsInitialized] = useState(null);
  const [isLocked, setIsLocked] = useState(null);

  const generateAgent = async () => {
    let ad4mClient = buildAd4mClient("ws://localhost:4000/graphql");
    let status = await ad4mClient.agent.status();
    console.log("agent status", status);
  };

  const renderNotInitializedContainer = () => (
    <button onClick={generateAgent}>
      Generate DID for agent
    </button>
  );

  return (
    <div className="App">
      <Header />
      {!isInitialized && renderNotInitializedContainer()}
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
