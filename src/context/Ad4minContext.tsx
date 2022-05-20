import { showNotification } from "@mantine/notifications";
import { Ad4mClient, ExceptionType } from "@perspect3vism/ad4m";
import { ExceptionInfo } from "@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver";
import { createContext, useCallback, useEffect, useState } from "react";
import { buildAd4mClient } from "../util";
import { appWindow } from '@tauri-apps/api/window'

type State = {
  url: string;
  did: string;
  isInitialized: Boolean;
  isUnlocked: Boolean;
  loading: boolean;
  client: Ad4mClient | null;
  candidate: string;
  connected: boolean;
  connectedLaoding: boolean;
}

type ContextProps = {
  state: State;
  methods: {
    configureEndpoint: (str: string) => void,
    resetEndpoint: () => void
    handleTrustAgent: (str: string) => void,
    
    handleLogin: (client: Ad4mClient, login: Boolean, did: string) => void,
  };
}

const initialState: ContextProps = {
  state: {
    url: '',
    isInitialized: false,
    did: '',
    isUnlocked: false,
    client: null,
    loading: false,
    candidate: '',
    connected: false,
    connectedLaoding: true
  },
  methods: {
    configureEndpoint: () => null,
    resetEndpoint: () => null,
    handleTrustAgent: () => null,
    handleLogin: () => null 
  }
}

export const Ad4minContext = createContext(initialState);


export function Ad4minProvider({ children }: any) {
  const [state, setState] = useState(initialState.state);

  
  const setConnected = (connected: boolean) => setState((prev) => ({
    ...prev,
    connected,
    connectedLaoding: false
  }));

  const checkConnection = useCallback(async (url: string, client: Ad4mClient): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (client) {
          const id = setTimeout(() => {
            resolve('')
          }, 1000);

          await client.agent.status(); // TODO runtime info is broken
          clearTimeout(id);

          console.log("get hc agent infos success.");

          resolve(url)
        }
      } catch (err) {
        if (url) {
          showNotification({
            message: 'Cannot connect to the URL provided please check if the executor is running or pass a different URL',
            color: 'red',
            autoClose: false
          })
        }

        resolve('')
      }
    })
  }, [])

  const handleLogin = useCallback((client: Ad4mClient, login: Boolean, did: string) => {
    setState((prev) => ({
      ...prev,
      isUnlocked: login,
      did: did,
      loading: false
    }))

    if (login) {
      client.runtime.addExceptionCallback((exception: ExceptionInfo) => {
        if (exception.type === ExceptionType.AgentIsUntrusted) {
          setState((prev) => ({
            ...prev, 
            candidate: exception.addon!
          }));
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
  }, []);
  
  const checkIfAgentIsInitialized = useCallback(async (client: Ad4mClient) => {
    console.log("Check if agent is initialized.", client)

    let status = await client?.agent.status();
    console.log("agent status in init: ", status);

    handleLogin(client, status.isUnlocked, status.did ? status.did! : "");

    return status;
  }, [handleLogin]);
  
  const Timeout = () => {
    let controller = new AbortController();
    setTimeout(() => controller.abort(), 20);
    return controller;
  };

  const findAd4mPort = useCallback(async () => {
    for (let i = 12000; i <= 13000; i++) {
      const url = `ws://localhost:${i}/graphql`;

      try {
        await fetch(`http://localhost:${i}`, {
          signal: Timeout().signal
        })
        const client = buildAd4mClient(url);
        const ad4mUrl = await checkConnection(url, client);

        const {isInitialized, isUnlocked} = await checkIfAgentIsInitialized(client);

        setState(prev => ({
          ...prev,
          client,
          url: ad4mUrl,
          isInitialized,
          isUnlocked,
          connected: true,
          connectedLaoding: false
        }));


        if (ad4mUrl) {
          localStorage.setItem('url', url);

          return ad4mUrl;
        };
      } catch (e) {
        console.log('failed', e)
      } 
    }

    setConnected(false);

    showNotification({
      message: 'Could not connect to ad4m executor running locally, please check if its running or submit the logs.',
      color: 'red',
      autoClose: false
    });
  }, [checkConnection, checkIfAgentIsInitialized])


  useEffect(() => {
    let localStorageURL = localStorage.getItem('url');

    if (localStorageURL && localStorageURL !== 'null' && !localStorageURL.includes('localhost')) {
      if (localStorageURL) {
        const client = buildAd4mClient(localStorageURL);
        checkConnection(localStorageURL, client).then((url) => {
          console.log('pp', url);
  
          checkIfAgentIsInitialized(client).then(({isInitialized, isUnlocked}) => {
            setState(prev => ({
              ...prev,
              client,
              url,
              isInitialized,
              isUnlocked,
              connected: true,
              connectedLaoding: false
            }));
          });
        }).catch((e) => {
          console.log('err', e)
  
          showNotification({
            message: 'Cannot connect to the URL provided please check if the executor is running or pass a different URL',
            color: 'red',
            autoClose: false
          });
        });
      }
    } else {
      findAd4mPort();
    }
  }, [checkConnection, checkIfAgentIsInitialized, findAd4mPort]);

  useEffect(() => {
    appWindow.listen('ready', () => {
      findAd4mPort();
    })
  }, [findAd4mPort])

  const handleTrustAgent = (candidate: string) => {
    setState((prev) => ({
      ...prev, 
      candidate
    }));
  }

  const configureEndpoint = (url: string) => {
    if (url) {
      setState((prev) => ({
        ...prev,
        url
      }));

      const client = buildAd4mClient(url);
      checkConnection(url, client).then((url) => {
        checkIfAgentIsInitialized(client).then(({isInitialized, isUnlocked}) => {
          setState(prev => ({
            ...prev,
            client,
            url,
            isInitialized,
            isUnlocked,
            connected: true,
            connectedLaoding: false
          }));

          localStorage.setItem('url', url as string);
        });
      });
    }
  }

  const resetEndpoint = () => {
    setState((prev) => ({
      ...prev,
      url: '',
      connected: false
    }))

    localStorage.removeItem('url');
  }

  useEffect(() => {
    if (state.url) {
      console.log('gggg 0', state.url);
      const client = buildAd4mClient(state.url)
      
      setState((prev) => ({
        ...prev,
        client
      }));
    }
  }, [state.url])

  return (
    <Ad4minContext.Provider 
      value={{
        state,
        methods: {
          configureEndpoint,
          handleTrustAgent,
          resetEndpoint,
          handleLogin
        }
      }}
    >
      {children}
    </Ad4minContext.Provider>
  )
}

