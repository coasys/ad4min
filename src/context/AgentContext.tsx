import { Ad4mClient, ExceptionType, Link } from "@perspect3vism/ad4m";
import { ExceptionInfo } from "@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver";
import { createContext, useEffect, useState } from "react";
import { AD4M_ENDPOINT } from "../config";
import { SOURCE_PROFILE, PREDICATE_FIRSTNAME, PREDICATE_LASTNAME } from "../constants/triples";
import { buildAd4mClient } from "../util";

type State = {
  url: string;
  isInitialized: Boolean;
  isUnlocked: Boolean;
  loading: boolean;
  client: Ad4mClient | null;
  did: string,
  candidate: string;
  connected: boolean;
}

type ContextProps = {
  state: State;
  methods: {
    setUrl: (str: string) => void,
    handleTrustAgent: (str: string) => void,
    unlockAgent: (str: string) => void,
    generateAgent: (firstName: string, lastName: string, password: string) => void,
  };
}

const initialState: ContextProps = {
  state: {
    url: AD4M_ENDPOINT,
    isInitialized: false,
    isUnlocked: false,
    client: null,
    loading: false,
    did: '',
    candidate: '',
    connected: false
  },
  methods: {
    setUrl: () => null,
    handleTrustAgent: () => null,
    unlockAgent: () => null,
    generateAgent: () => null,
  }
}

export const AgentContext = createContext(initialState);


export function AgentProvider({ children }: any) {
  const [state, setState] = useState(initialState.state);

  useEffect(() => {
    const client = state.client!;
    const setConnected = (connected: boolean) => setState((prev) => ({
      ...prev,
      connected
    }));

    const checkConnection = async () => {
      try {
        await client.runtime.hcAgentInfos(); // TODO runtime info is broken
        console.log("get hc agent infos success.");
        setConnected(true);
      } catch (err) {
        setConnected(false);
      }
    }

    checkConnection();

    console.log("Check if ad4m service is connected.")
  }, [state.client]);

  useEffect(() => {
    const client = state.client!;
    const checkIfAgentIsInitialized = async () => {
      let status = await client?.agent.status();
      console.log("agent status in init: ", status);

      setState((prev) => ({
        ...prev,
        isInitialized: status.isInitialized!,
        isUnlocked: status.isUnlocked!
      }))

      handleLogin(status.isUnlocked, status.did ? status.did! : "");
    };
    if (client) {
      checkIfAgentIsInitialized();
    }


    console.log("Check if agent is initialized.")
  }, [state.client]);

  const handleLogin = (login: Boolean, did: string) => {
    const client = state.client!;
    setState((prev) => ({
      ...prev,
      isUnlocked: login,
      did: did
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
  }

  const handleTrustAgent = (candidate: string) => {
    setState((prev) => ({
      ...prev, 
      candidate
    }));
  }

  const setUrl = (url: string) => {
    setState((prev) => ({
      ...prev,
      url
    }))
  }

  const generateAgent = async (firstName: string, lastName: string, password: string) => {
    const client = state.client!;
    
    setState((prev) => ({
      ...prev,
      loading: true,
    }))

    let agentStatus = await client.agent.generate(password);
    const agentPerspective = await client.perspective.add(
      "Agent Profile"
    );
    const links = [];

    if (firstName) {
      const link = await client.perspective.addLink(
        agentPerspective.uuid,
        new Link({
          source: SOURCE_PROFILE,
          target: firstName,
          predicate: PREDICATE_FIRSTNAME
        })
      );

      links.push(link);
    }

    if (lastName) {
      const link = await client.perspective.addLink(
        agentPerspective.uuid,
        new Link({
          source: SOURCE_PROFILE,
          target: lastName,
          predicate: PREDICATE_LASTNAME
        })
      );

      links.push(link)
    }

    const cleanedLinks = [];

    for (const link of links) {
      const newLink = JSON.parse(JSON.stringify(link));
      newLink.__typename = undefined;
      newLink.data.__typename = undefined;
      newLink.proof.__typename = undefined;

      cleanedLinks.push(newLink);
    }

    await client.agent.updatePublicPerspective({
      links: cleanedLinks
    })

    handleLogin(agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in generate: ", agentStatus);
  };

  const unlockAgent = async (password: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }))
    let agentStatus = await state.client?.agent.unlock(password);
    handleLogin(agentStatus!.isUnlocked, agentStatus!.did!);

    console.log("agent status in unlock: ", agentStatus);
  }

  useEffect(() => {
    const client = buildAd4mClient(state.url)
    
    setState((prev) => ({
      ...prev,
      client
    }));

    console.log('haha', state)
  }, [state.url])
  
  return (
    <AgentContext.Provider 
      value={{
        state,
        methods: {
          setUrl,
          handleTrustAgent,
          generateAgent,
          unlockAgent
        }
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

