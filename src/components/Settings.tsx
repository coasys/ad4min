import { ActionIcon, Button, Center, Container, Group, Modal, PasswordInput, Space, Stack, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useContext, useEffect, useState } from 'react';
import { Copy, Qrcode as QRCodeIcon } from 'tabler-icons-react';
import { Ad4minContext } from '../context/Ad4minContext';
import { AgentContext } from '../context/AgentContext';
import { MainContainer, MainHeader } from './styles';
import { invoke } from '@tauri-apps/api';
import QRCode from 'react-qr-code';

function Settings() {
  const {
    state: {
      loading
    },
    methods: {
      lockAgent
    } } = useContext(AgentContext);

  const {
    state: {
      url,
      did,
    } } = useContext(Ad4minContext);

  const [password, setPassword] = useState('');
  const [lockAgentModalOpen, setLockAgentModalOpen] = useState(false);
  const [proxy, setProxy] = useState('');
  const [qrcodeModal, setQRCodeModal] = useState(false);

  useEffect(() => {
    const getProxy = async () => {
      const proxy: string = await invoke("get_proxy");
      console.log(proxy);
      setProxy(proxy);
    }
    getProxy().catch(console.error);;
  }, []);

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setPassword(value);
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    showNotification({
      message: 'URL copied to clipboard',
      autoClose: 1000
    });
  }

  const setupProxy = async () => {
    const proxy: string = await invoke("setup_proxy", { subdomain: did });
    console.log("Finish setup proxy, ", proxy);
    setProxy(proxy);
  }

  const stopProxy = async () => {
    await invoke("stop_proxy");
    setProxy('');
  }

  const copyProxy = () => {
    navigator.clipboard.writeText(proxy);
    showNotification({
      message: 'Proxy endpoint copied to clipboard',
      autoClose: 1000
    });
  }

  const showProxyQRCode = () => {
    setQRCodeModal(true);
  }

  const showProxy = () => {
    if (proxy) {
      return (
        <div>
          <Group align="center" style={{}}>
            <Text size="lg" weight={700}>Proxy endpoint: </Text>
            <span>{proxy}</span>
            <ActionIcon onClick={copyProxy}>
              <Copy />
            </ActionIcon>
            <ActionIcon onClick={showProxyQRCode}>
              <QRCodeIcon />
            </ActionIcon>
          </Group>
          <Space h="md" />
          <Button style={{ width: '120px' }} onClick={stopProxy}>Stop Proxy</Button>
        </div>
      )
    } else {
      return (
        <Button style={{ width: '120px' }} onClick={setupProxy}>Setup Proxy</Button>
      )
    }
  }

  return (
    <Container
      style={MainContainer}
    >
      <div style={MainHeader}>
        <Title order={3}>Settings</Title>
      </div>
      <Stack style={{
        padding: '80px 20px 20px 20px'
      }}>
        <Group align="center" style={{}}>
          <Text size="lg" weight={700}>Connected executor URL: </Text>
          <span>{url}</span>
          <ActionIcon onClick={copyUrl}>
            <Copy />
          </ActionIcon>
        </Group>
        <Button style={{ width: '120px' }} onClick={() => setLockAgentModalOpen(true)}>Lock Agent</Button>
        {showProxy()}
      </Stack>
      <Modal
        opened={lockAgentModalOpen}
        onClose={() => setLockAgentModalOpen(false)}
        title="Lock Agent"
        size={700}
        style={{ zIndex: 100 }}
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
      <Modal
        opened={qrcodeModal}
        onClose={() => setQRCodeModal(false)}
        title="Proxy QR Code"
        centered
      >
        <Center>
          <QRCode value={proxy} />
        </Center>
      </Modal>
    </Container>
  )
}

export default Settings