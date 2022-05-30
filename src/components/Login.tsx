import { PasswordInput, Button, Stack, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { AgentContext } from '../context/AgentContext';
import { Link } from 'tabler-icons-react';
import { Ad4minContext } from '../context/Ad4minContext';
import { useNavigate } from 'react-router-dom';


const Login = (props: any) => {
  const {state: {
    loading,
  }, methods: {
    generateAgent,
    unlockAgent,
  }} = useContext(AgentContext)

  const {state: {
    isInitialized,
    isUnlocked,
    connected
  }, methods: {
    resetEndpoint
  }} = useContext(Ad4minContext)
  
  let navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [opened, setOpened] = useState(false);

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

  useEffect(() => {
      if (!connected) {
        navigate('/connect');
      } else if (connected && isUnlocked) {
        navigate('/profile');
      }
  }, [connected, isUnlocked, navigate])

  return (
    <div>
      <Stack align="center" spacing="xl">
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20
        }}>
          <Tooltip
            label="Change ad4m-executor url"
            opened={opened}
            position="left"
            placement="center"
            withArrow
          >
            <ActionIcon 
              onMouseEnter={() => setOpened(true)} 
              onMouseLeave={() => setOpened(false)}
              onClick={() => resetEndpoint()}
            >
              <Link />
            </ActionIcon >
          </Tooltip>
        </div>
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
          <Button onClick={() => generateAgent(firstName, lastName, password)} loading={loading}>
            Generate agent
          </Button>
        }
        {
          isInitialized && !isUnlocked &&
          <Button onClick={() => unlockAgent(password)} loading={loading}>
            Unlock agent
          </Button>
        }
      </Stack>
    </div>
  )
}

export default Login