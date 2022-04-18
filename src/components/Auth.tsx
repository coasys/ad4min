import { Button, Group, Modal, Space, Stack, TextInput } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { Ad4mContext } from '..';
import { showNotification } from '@mantine/notifications';

type Props = {
  info: string,
  handleAuth: (auth: string) => void,
}

const Auth = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setOpened(true);
  }, []);

  const permitAuth = async () => {
    let result = await ad4mClient.agent.permitAuth(props.info);

    console.log(`permit result: ${result}`);

    closeModal();
    showNotification({
      message: 'Great, the authentication is permitted now! 🤥',
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