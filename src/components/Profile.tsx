import { Text } from '@mantine/core';

type Props = {
  did: String,
}

const Login = (props: Props) => {
  return (
    <div>
      <Text size='lg' weight={700}>Agent DID: </Text>
      <Text size="md">{props.did}</Text>
    </div>
  )
}

export default Login