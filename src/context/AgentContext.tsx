import { showNotification } from "@mantine/notifications";
import { Ad4mClient, ExceptionType, Link } from "@perspect3vism/ad4m";
import { ExceptionInfo } from "@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver";
import { createContext, useContext, useEffect, useState } from "react";
import { AD4M_ENDPOINT } from "../config";
import { SOURCE_PROFILE, PREDICATE_FIRSTNAME, PREDICATE_LASTNAME } from "../constants/triples";
import { buildAd4mClient } from "../util";
import { Ad4minContext } from "./Ad4minContext";

type State = {
  loading: boolean;
}

type ContextProps = {
  state: State;
  methods: {
    unlockAgent: (str: string) => void,
    lockAgent: (str: string) => void,
    generateAgent: (firstName: string, lastName: string, password: string) => void,
  };
}

const initialState: ContextProps = {
  state: {
    loading: false,
  },
  methods: {
    unlockAgent: () => null,
    lockAgent: () => null,
    generateAgent: () => null,
  }
}

export const AgentContext = createContext(initialState);


export function AgentProvider({ children }: any) {
  const {state: {
    client
  }, methods: {
    handleLogin
  }} = useContext(Ad4minContext);
  
  const [state, setState] = useState(initialState.state);

  
  const setLoading = (loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading
    }))
  }

  const generateAgent = async (firstName: string, lastName: string, password: string) => {
    setLoading(true);

    let agentStatus = await client!.agent.generate(password);
    const agentPerspective = await client!.perspective.add(
      "Agent Profile"
    );
    const links = [];

    if (firstName) {
      const link = await client!.perspective.addLink(
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
      const link = await client!.perspective.addLink(
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

    await client?.agent.updatePublicPerspective({
      links: cleanedLinks
    })

    handleLogin(agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in generate: ", agentStatus);

    setLoading(false);
  };

  const unlockAgent = async (password: string) => {
    setLoading(true)
    let agentStatus = await client?.agent.unlock(password);
    handleLogin(agentStatus!.isUnlocked, agentStatus!.did!);

    console.log("agent status in unlock: ", agentStatus);

    setLoading(false);
  }

  const lockAgent = async (passphrase: string) => {
    setLoading(true);

    const status = await client!.agent.lock(passphrase);

    handleLogin(status!.isUnlocked, status!.did!);

    setLoading(false);
  } 

  return (
    <AgentContext.Provider 
      value={{
        state,
        methods: {
          generateAgent,
          unlockAgent,
          lockAgent,
        }
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}
