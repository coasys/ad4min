import { PasswordInput, Button, Stack, TextInput } from '@mantine/core';
import { Link } from '@perspect3vism/ad4m';
import { useContext, useEffect, useState } from 'react';
import { AgentContext } from '../context/AgentContext';
import { PREDICATE_FIRSTNAME, PREDICATE_LASTNAME, SOURCE_PROFILE } from '../constants/triples';


const Login = (props: any) => {
  const {state: {
    isInitialized,
    loading,
    isUnlocked
  }, methods: {
    generateAgent,
    unlockAgent
  }} = useContext(AgentContext)
  
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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