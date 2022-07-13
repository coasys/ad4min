import { Link, Literal } from "@perspect3vism/ad4m";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SOURCE_PROFILE, PREDICATE_FIRSTNAME, PREDICATE_LASTNAME, PREDICATE_USERNAME } from "../constants/triples";
import { Ad4minContext } from "./Ad4minContext";

type State = {
  loading: boolean;
}

type ContextProps = {
  state: State;
  methods: {
    unlockAgent: (str: string) => void,
    lockAgent: (str: string) => void,
    generateAgent: (username: string, firstName: string, lastName: string, password: string) => void,
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
  let navigate = useNavigate();

  const [state, setState] = useState(initialState.state);

  
  const setLoading = (loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading
    }))
  }

  const generateAgent = async (username: string, firstName: string, lastName: string, password: string) => {
    setLoading(true);

    let agentStatus = await client!.agent.generate(password);
    const agentPerspective = await client!.perspective.add(
      "Agent Profile"
    );
    const links = [];

    const link = await client!.perspective.addLink(
      agentPerspective.uuid,
      new Link({
        source: agentStatus.did!,
        target: Literal.from(username).toUrl(),
        predicate: PREDICATE_USERNAME
      })
    );

    links.push(link);


    if (firstName) {
      const link = await client!.perspective.addLink(
        agentPerspective.uuid,
        new Link({
          source: agentStatus.did!,
          target: Literal.from(firstName).toUrl(),
          predicate: PREDICATE_FIRSTNAME
        })
      );

      links.push(link);
    }

    if (lastName) {
      const link = await client!.perspective.addLink(
        agentPerspective.uuid,
        new Link({
          source: agentStatus.did!,
          target: Literal.from(lastName).toUrl(),
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

    handleLogin(client!, agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in generate: ", agentStatus);

    setLoading(false);

    navigate('/profile');
  };

  const unlockAgent = async (password: string) => {
    setLoading(true)
    
    let agentStatus = await client?.agent.unlock(password);

    handleLogin(client!, agentStatus!.isUnlocked, agentStatus!.did!);

    console.log("agent status in unlock: ", agentStatus);

    setLoading(false);

    navigate('/profile');
  }

  const lockAgent = async (passphrase: string) => {
    setLoading(true);

    const status = await client!.agent.lock(passphrase);

    handleLogin(client!, status!.isUnlocked, status!.did!);

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
