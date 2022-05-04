import { Avatar, Button, Card, Container, Group, List, Modal, Space, Text, ThemeIcon, Title } from '@mantine/core';
import { Agent } from '@perspect3vism/ad4m';
import { useContext, useEffect, useState } from 'react';
import { CircleCheck } from 'tabler-icons-react';
import { Ad4mContext } from '..';
import { PREDICATE_FIRSTNAME, PREDICATE_LASTNAME, SOURCE_PROFILE } from '../constants/triples';
import { MainContainer, MainHeader } from './styles';

type Props = {
  did: String,
}

const Profile = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [trustedAgents, setTrustedAgents] = useState<any[]>([]);

  const [trustedAgentModalOpen, settrustedAgentModalOpen] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: ""
  })

  const getTrustedAgents = async () => {
    const trustedAgents = await ad4mClient.runtime.getTrustedAgents()
    
    const tempTempAgents = [];
    
    for (const agent of trustedAgents) {
      const fetchedAgent = await ad4mClient.agent.byDID(agent)

      if (fetchedAgent) {
        const profile = await fetchProfile(fetchedAgent)
  
        tempTempAgents.push({did: agent, ...profile});
      } else {
        tempTempAgents.push({did: agent});
      }

    }

    setTrustedAgents(tempTempAgents);
  }

  const fetchProfile = async (agent: Agent) => {
    const tempProfile = {
      firstName: "",
      lastName: ""
    }

    for (const { data: {source, predicate, target} } of agent.perspective?.links!) {
      if (source === SOURCE_PROFILE) {
        if (predicate === PREDICATE_FIRSTNAME) {
          tempProfile.firstName = target
        } else if (predicate === PREDICATE_LASTNAME) {
          tempProfile.lastName = target;
        }
      }
    }

    return tempProfile;
  }

  const fetchCurrentAgentProfile = async () => {
    const agent = await ad4mClient.agent.me();

    const profile = await fetchProfile(agent);
    
    setProfile(profile);
  }

  useEffect(() => {
    fetchCurrentAgentProfile();
    getTrustedAgents();
  }, [])

  return (
    <Container style={MainContainer}>
      <Container style={MainHeader}>
        <Button onClick={() => settrustedAgentModalOpen(true)}>Trusted Agents</Button>
      </Container>
      <Container
        style={{ marginLeft: 30, marginTop: 62 }}
      >
        <Space h="md" />
        <Text size="md" weight="bold" underline>Agent DID: </Text>
        <Text size="md">{props.did}</Text>
        <Space h="md" />
        <Text size="md" weight="bold" underline>Name: </Text>
        <Text size="md">{profile.firstName} {profile.lastName}</Text>
        <Space h="md" />
      </Container>
      <Modal
        opened={trustedAgentModalOpen}
        onClose={() => settrustedAgentModalOpen(false)}
        title="Trusted Agents"
        size={700}
      >
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
          {trustedAgents.map((e, i) => (
            <Card shadow="sm" withBorder={true} style={{ marginBottom: trustedAgents.length-1 === i ? 0 : 20 }}>
              <Group align="flex-start">
                <Avatar radius="xl"></Avatar>
                <Group direction='column' style={{marginTop: 4}}>
                  <Group  direction='row'>
                    <Text weight="bold">DID: </Text>
                    <Text>{e.did}</Text>
                  </Group>
                  {(e.firstName || e.lastName) && (<Group>
                    <Text weight="bold">Name: </Text>
                    <Text>{`${e.firstName || ""} ${e.lastName || ""}`}</Text>
                  </Group>)}
                </Group>
              </Group>
            </Card>
          ))}
        </List>
      </Modal>
    </Container>
  )
}

export default Profile