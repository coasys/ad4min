import { Button, Group, Modal, Space, Stack, TextInput } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Ad4minContext } from '../context/Ad4minContext';

type Props = {
  info: string,
  handleAuth: (auth: string) => void,
}

const Auth = (props: Props) => {
  const {
    state: {
      client
    }
  } = useContext(Ad4minContext);

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setOpened(true);
  }, []);

  const permitAuth = async () => {
    let result = await client!.agent.permitAuth(props.info);

    let permitResult = JSON.stringify(result);
    console.log(`permit result: ${permitResult}`);

    closeModal();
    showNotification({
      message: `Great, the authentication is permitted now! 🤥   ${permitResult}`,
    })
  }

  const closeModal = () => {
    props.handleAuth("");
  }

  return (
    <div>
      <Modal
        size="lg"
        opened={opened}
        onClose={() => closeModal()}
        title="Request Authentication"
      >
        <Stack>
          <TextInput
            defaultValue={props.info}
            label="Auth Information"
            disabled
          />
          <TextInput
            defaultValue={JSON.parse(props.info).auth.appName}
            label="app name"
            disabled
          />
          <TextInput
            defaultValue={JSON.parse(props.info).auth.appDesc}
            label="app desc"
            disabled
          />
          <TextInput
            defaultValue={JSON.parse(props.info).auth.appUrl}
            label="app url"
            disabled
          />
          <TextInput
            defaultValue={JSON.parse(props.info).auth.capabilities}
            label="app cap"
            disabled
          />
          <TextInput
            defaultValue={JSON.parse(props.info).requestId}
            label="request id"
            disabled
          />
          <Group>
            <Button variant="outline" onClick={() => closeModal()}>
              Close
            </Button>
            <Space h="md" />
            <Button onClick={permitAuth}>
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  )
}

export default Auth
