import { Button, Container, TextInput, Text, Modal, MultiSelect, Space, Group, List, Card, Avatar, Chip, Header, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { LanguageHandle } from '@perspect3vism/ad4m';
import { useContext, useEffect, useState } from 'react';
import { AgentContext } from '../context/AgentContext';
import { generateLanguageInitials, isSystemLanguage } from '../util';
import { MainContainer, MainHeader } from './styles';

type Props = {
}

const Language = (props: Props) => {
  const {state: {
    client
  }} = useContext(AgentContext);

  const [languages, setLanguages] = useState<any[] | null[]>([]);
  const [installLanguageModalOpen, setInstallLanguageModalOpen] = useState(false);

  const [languageName, setLanguageName] = useState("");
  const [languageDescription, setLanguageDescription] = useState("");
  const [languageSourceLink, setLanguageSourceLink] = useState("");
  const [languageBundlePath, setLanguageBundlePath] = useState("");
  const [data, setData] = useState<any[]>([]);

  const installLanguage = async () => {
    if (languageBundlePath) {
      const installedLanguage = await client!.languages.publish(languageBundlePath, {
        name: languageName,
        description: languageDescription,
        possibleTemplateParams: data,
        sourceCodeLink: languageSourceLink
      });

      await client!.languages.byAddress(installedLanguage.address)

      await getLanguages()

      setInstallLanguageModalOpen(false)

      showNotification({
        message: 'Language sucessfully installed',
      })
    } else {
      showNotification({
        message: 'Language file missing',
        color: 'red'
      })
    }
  }

  const getLanguages = async () => {
    const langs = await client!.languages.all();

    const perspectives = await client!.perspective.all();

    const tempLangs = [];
    
    for (const lang of langs) {
      const found = perspectives.find(p => {
        if (p.neighbourhood) {
          if (p.neighbourhood.linkLanguage === lang.address) {
            return true;
          } else {
            return p.neighbourhood.meta.links.filter(l => l.data.predicate === 'language')
              .find(l => l.data.target === lang.address)
          }
        }

        return false;
      });

      tempLangs.push({language: lang, perspective: found})
    }

    setLanguages(tempLangs);
  }

  useEffect(() => {
    getLanguages();
  }, [])

  return (
    <Container style={MainContainer}>
      <div style={MainHeader}>
        <Title order={3}>Langauges</Title>
        <Button onClick={() => setInstallLanguageModalOpen(true)}>Install Language</Button>
      </div>
      <List 
        spacing="xs"
        size="sm"
        center
        pl={20}
        mt={20}
        mr={20}
        style={{
          overflow: 'auto',
          height: 'auto',
          paddingTop: 80,
          maxWidth: 960
        }}
      >
        {languages.map((e, i) => {
          const {language, perspective} = e;
          const isSystem = isSystemLanguage(language!.name)

          return (
          <Card key={`language-${language?.address}`} shadow="sm" withBorder={true} style={{ marginBottom: 20 }}>
            <Group align="flex-start">
              <Avatar radius="xl">{generateLanguageInitials(language!.name)}</Avatar>
              <Group direction='column' style={{marginTop: 4}}>
                <Group  direction='row'>
                  <Text weight="bold">DID: </Text>
                  <Text>{language?.address}</Text>
                </Group>
                <Group  direction='row'>
                  <Text weight="bold">Name: </Text>
                  <Text>{language?.name}</Text>
                </Group>
                {perspective && (
                  <Group  direction='row'>
                    <Text weight="bold">Perspective: </Text>
                    <Text>{perspective?.name}</Text>
                  </Group>
                )}
                {isSystem ? (
                  <div style={{padding: '4px 12px', background: 'rgb(243, 240, 255)', borderRadius: 30, color: '#845EF7'}}>
                    System
                  </div>
                ) : (
                  <div style={{padding: '4px 12px', background: '#FFF0F6', borderRadius: 30, color: 'rgb(230, 73, 128)'}}>
                  Installed
                  </div>
                )}
              </Group>
            </Group>
          </Card>
        )})}
      </List>
      <Modal
        opened={installLanguageModalOpen}
        onClose={() => setInstallLanguageModalOpen(false)}
        title="Install Langauge"
        size={700}
        style={{zIndex: 100}}
      >
        <TextInput 
          label="Name"
          required
          placeholder='ex. Social-Context' 
          radius="md" 
          size="md" 
          onChange={(e) => setLanguageName(e.target.value)}
        />
        <Space h="md"  />
        <TextInput 
          label="Description" 
          required
          placeholder='Describe what the language does here.' 
          radius="md" 
          size="md" 
          onChange={(e) => setLanguageDescription(e.target.value)}
        />
        <Space h="md"  />
        <TextInput 
          label="Souce Code Link" 
          required
          placeholder='ex. www.example.com' 
          radius="md" 
          size="md" 
          onChange={(e) => setLanguageSourceLink(e.target.value)}
        />
        <Space h="md"  />
        <MultiSelect
          label="Params"
          data={data}
          required
          placeholder="Add Items"
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => setData((current: any) => [...current, query])}
        />
        <Space h="md"  />
        <TextInput 
          label="Language Bundle Path" 
          required
          placeholder='ex. dev/example/language.js' 
          radius="md" 
          size="md" 
          onChange={(e) => setLanguageBundlePath(e.target.value)}
        />
        <Space h="md"  />
        <Group direction='row'>
          <Button onClick={() => setInstallLanguageModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={installLanguage}>
            Install
          </Button>
        </Group>
      </Modal>
    </Container>
  )
}

export default Language