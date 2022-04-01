import { PasswordInput, Button, Stack } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { Ad4mContext } from '..';

type Props = {
  handleLogin: (isUnlocked: Boolean, did: string) => void;
}

const Login = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [password, setPassword] = useState("");
  const [isInitialized, setIsInitialized] = useState<Boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<Boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfAgentIsInitialized = async () => {
      let status = await ad4mClient.agent.status();
      console.log("agent status in init: ", status);

      setIsInitialized(status.isInitialized);
      setIsUnlocked(status.isUnlocked);

      props.handleLogin(status.isUnlocked, status.did ? status.did! : "");
    };
    checkIfAgentIsInitialized();

    console.log("Check if agent is initialized.")
  }, [ad4mClient, props]);

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  const generateAgent = async (event: React.SyntheticEvent) => {
    setLoading(true);
    let agentStatus = await ad4mClient.agent.generate(password);
    props.handleLogin(agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in generate: ", agentStatus);
  };

  const unlockAgent = async (event: React.SyntheticEvent) => {
    setLoading(true);
    let agentStatus = await ad4mClient.agent.unlock(password);
    props.handleLogin(agentStatus.isUnlocked, agentStatus.did!);

    console.log("agent status in unlock: ", agentStatus);
  }

  return (
    <div>
      <Stack align="center" spacing="xl">
        <div style={{ width: 280 }}>
          <PasswordInput
            placeholder="Password"
            label="Input your passphrase"
            radius="md"
            size="md"
            required
            onChange={onPasswordChange}
          />
        </div>

        {
          !isInitialized &&
          <Button onClick={generateAgent} loading={loading}>
            Generate agent
          </Button>
        }
        {
          isInitialized && !isUnlocked &&
          <Button onClick={unlockAgent} loading={loading}>
            Unlock agent
          </Button>
        }
      </Stack>
    </div>
  )
}

export default Login