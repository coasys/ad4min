import { Container, Space, Text, Title } from '@mantine/core';

type Props = {
  did: String,
}

const Profile = (props: Props) => {
  return (
    <Container
      style={{ marginLeft: 30, marginTop: 62 }}
    >
      <Space h="md" />
      <Title order={3}>Agent DID: </Title>
      <Text size="md">{props.did}</Text>
    </Container>
  )
}

export default Profile