import { ActionIcon, Button, Container, Group, Modal, PasswordInput, Space, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useContext, useState } from 'react';
import { Copy } from 'tabler-icons-react';
import { Ad4minContext } from '../context/Ad4minContext';
import { AgentContext } from '../context/AgentContext';
import { MainContainer, MainHeader } from './styles';

function Settings() {
  const {
    state: {
      loading
    },
    methods: {
    lockAgent
  }} = useContext(AgentContext);

  const {
    state: {
      url
    }} = useContext(Ad4minContext);

  const [password, setPassword] = useState('');
  const [lockAgentModalOpen, setLockAgentModalOpen] = useState(false);
  
  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    showNotification({
      message: 'URL copied to clipboard',
      autoClose: 1000
    });
  }

  return (
    <Container
      style={MainContainer}
    >
      <div style={MainHeader}>
        <Title order={3}>Settings</Title>
      </div>
      <Container style={{
        padding: '80px 20px 20px 20px'
      }}>
        <div>
          <Group align="center" style={{}}>
            <Text size="lg" weight={700}>Connected executor URL: </Text>
            <span>{url}</span>
            <ActionIcon onClick={copyToClipboard}>
              <Copy />
            </ActionIcon>
          </Group>
        </div>
        <Space h="md" />
        <Button onClick={() => setLockAgentModalOpen(true)}>Lock Agent</Button>
      </Container>
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