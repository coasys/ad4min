import { PasswordInput, Button, Stack, TextInput } from '@mantine/core';
import { Link } from '@perspect3vism/ad4m';
import { useContext, useEffect, useState } from 'react';
import { Ad4mContext } from '..';
import { PREDICATE_FIRSTNAME, PREDICATE_LASTNAME, SOURCE_PROFILE } from '../constants/triples';

type Props = {
  handleLogin: (isUnlocked: Boolean, did: string) => void;
}

const Login = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  const onFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const { value } = event.target;
    setFirstName(value);
  }

  const onLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const { value } = event.target;
    setLastName(value);
  }

  const generateAgent = async (event: React.SyntheticEvent) => {
    setLoading(true);
    let agentStatus = await ad4mClient.agent.generate(password);
    const agentPerspective = await ad4mClient.perspective.add(
      "Agent Profile"
    );
    const links = [];

    if (firstName) {
      const link = await ad4mClient.perspective.addLink(
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
      const link = await ad4mClient.perspective.addLink(
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

    await ad4mClient.agent.updatePublicPerspective({
      links: cleanedLinks
    })

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
          {!isInitialized && (
            <>
              <TextInput 
                label="First Name" 
                placeholder='Satoshi' 
                radius="md" 
                size="md" 
                onChange={onFirstNameChange}
              />
              <TextInput 
                label="Last Name" 
                placeholder='Nakamoto' 
                radius="md" 
                size="md" 
                onChange={onLastNameChange}
              />
            </>)
          }
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