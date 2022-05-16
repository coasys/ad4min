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

    console.log(`permit result: ${result}`);

    closeModal();
    showNotification({
      message: `Great, the authentication is permitted now! 🤥   ${result}`,
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
