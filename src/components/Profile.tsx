import { Container, Space, Text } from '@mantine/core';

type Props = {
  did: String,
}

const Login = (props: Props) => {
  return (
    <Container
      style={{ marginLeft: 10 }}
    >
      <Space h="md" />
      <Text size='lg' weight={700}>Agent DID: </Text>
      <Text size="md">{props.did}</Text>
    </Container>
  )
}

export default Login