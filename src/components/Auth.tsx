import { Button, Group, Modal, Space, Stack, Text, TextInput, List, ThemeIcon } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Ad4minContext } from '../context/Ad4minContext';
import { CircleCheck } from 'tabler-icons-react';

type Props = {
  info: string,
  handleAuth: (auth: string) => void,
}

interface Capability {
  with: Resource,
  can: string[],
}

interface Resource {
  domain: string,
  pointers: string[],
}

const Auth = (props: Props) => {
  const {
    state: {
      client
    }
  } = useContext(Ad4minContext);

  const [opened, setOpened] = useState(false);

  const authInfo = JSON.parse(props.info).auth;

  useEffect(() => {
    setOpened(true);
  }, []);

  const permitCapability = async () => {
    let result = await client!.agent.permitCapability(props.info);

    let permitResult = JSON.stringify(result);
    console.log(`permit result: ${permitResult}`);

    closeModal();
    showNotification({
      title: "Capability is permitted!",
      message: `Now go to App, and input the 6 digits secret code: ${permitResult}`,
      autoClose: false,
    })
  }

  const closeModal = () => {
    props.handleAuth("");
  }

  const showCapabilities = (capabilities: Capability[]) => {
    return (
      <List
        spacing="xs"
        size="sm"
        center
        icon={
          <ThemeIcon color="teal" size={24} radius="xl">
            <CircleCheck size={16} />
          </ThemeIcon>
        }
      >
        {
          capabilities.map(cap => <List.Item>{`${cap.can} => ${cap.with.domain}.${cap.with.pointers}`}</List.Item>)
        }
      </List>

    )
  }

  return (
    <div>
      <Modal
        size="lg"
        opened={opened}
        onClose={() => closeModal()}
        title="Request Capabilities"
      >
        <Stack>
        <TextInput
            value={authInfo.appName}
            label="App Name"
            disabled
          />
          <TextInput
            value={authInfo.appDesc}
            label="App Description"
            disabled
          />
          <TextInput
            value={authInfo.appUrl}
            label="App URL"
            disabled
          />
          <Text>Request for these capabilities,</Text>
          {showCapabilities(authInfo.capabilities)}
          <Group>
            <Button variant="outline" onClick={() => closeModal()}>
              Close
            </Button>
            <Space h="md" />
            <Button onClick={permitCapability}>
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  )
}

export default Auth
