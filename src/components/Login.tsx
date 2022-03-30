import { TextInput, Button } from '@mantine/core';
import { Ad4mClient } from '@perspect3vism/ad4m';
import { useState } from 'react';

type Props = {
  ad4mClient: Ad4mClient,
  isInitialized: Boolean | null,
  isUnlocked: Boolean | null,
  handleLogin: (isUnlocked: Boolean, did: String) => void;
}

const Login = (props: Props) => {
  const [password, setPassword] = useState("");

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  const generateAgent = async (event: React.SyntheticEvent) => {
    let agentStatus = await props.ad4mClient.agent.generate(password);
    props.handleLogin(agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in generate: ", agentStatus);
  };

  const unlockAgent = async (event: React.SyntheticEvent) => {
    let agentStatus = await props.ad4mClient.agent.unlock(password);
    props.handleLogin(agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in unlock: ", agentStatus);
  }

  return (
    <div>
      <TextInput type="text" placeholder="Input passphrase" value={password} onChange={onPasswordChange} />
      {
        !props.isInitialized &&
        <Button onClick={generateAgent}>
          Generate agent
        </Button>
      }
      {
        props.isInitialized && !props.isUnlocked &&
        <Button onClick={unlockAgent}>
          Unlock agent
        </Button>
      }
    </div>
  )
}

export default Login