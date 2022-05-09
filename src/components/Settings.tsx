import { Avatar, Button, Card, Container, Group, List, Modal, PasswordInput, Space, Text, ThemeIcon, Title } from '@mantine/core';
import { useContext, useState } from 'react';
import { Stack } from 'tabler-icons-react';
import { AgentContext } from '../context/AgentContext';
import { MainContainer, MainHeader } from './styles';

function Settings() {
  const {
    state: {
      loading
    },
    methods: {
    lockAgent
  }} = useContext(AgentContext)

  const [password, setPassword] = useState('');
  const [lockAgentModalOpen, setLockAgentModalOpen] = useState(false);
  
  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  return (
    <Container
      style={MainContainer}
    >
      <div style={MainHeader}>
        <Title order={3}>Settings</Title>
      </div>
      <div style={{
        paddingTop: 80
      }}>
        <Button onClick={() => setLockAgentModalOpen(true)}>Lock Agent</Button>
      </div>
      <Modal
        opened={lockAgentModalOpen}
        onClose={() => setLockAgentModalOpen(false)}
        title="Lock Agent"
        size={700}
        style={{zIndex: 100}}
      >
        <PasswordInput
          placeholder="Password"
          label="Input your passphrase"
          radius="md"
          size="md"
          required
          onChange={onPasswordChange}
        />
        <Space h={20} />
        <Button onClick={() => lockAgent(password)} loading={loading}>
          Lock agent
        </Button>
      </Modal>
    </Container>
  )
}

export default Settings