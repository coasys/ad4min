import { Button, Container, TextInput, Text, Modal, MultiSelect, Space, Group, List, Card, Avatar, Chip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { LanguageHandle } from '@perspect3vism/ad4m';
import { useContext, useEffect, useState } from 'react';
import { Ad4mContext } from '..';
import { generateLanguageInitials, isSystemLanguage } from '../util';
import { MainContainer, MainHeader } from './styles';

type Props = {
}

const Language = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [languages, setLanguages] = useState<LanguageHandle[] | null[]>([]);
  const [installLanguageModalOpen, setInstallLanguageModalOpen] = useState(false);

  const [languageName, setLanguageName] = useState("");
  const [languageDescription, setLanguageDescription] = useState("");
  const [languageSourceLink, setLanguageSourceLink] = useState("");
  const [languageBundlePath, setLanguageBundlePath] = useState("");
  const [data, setData] = useState<any[]>([]);

  const installLanguage = async () => {
    if (languageBundlePath) {
      const installedLanguage = await ad4mClient.languages.publish(languageBundlePath, {
        name: languageName,
        description: languageDescription,
        possibleTemplateParams: data,
        sourceCodeLink: languageSourceLink
      });

      await ad4mClient.languages.byAddress(installedLanguage.address)

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
    const langs = await ad4mClient.languages.all();

    setLanguages(langs);
  }

  useEffect(() => {
    getLanguages();
  }, [])

  return (
    <div style={MainContainer}>
      <Container style={MainHeader}>
        <Button onClick={() => setInstallLanguageModalOpen(true)}>Install Language</Button>
      </Container>
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
        }}
      >
        {languages.map((e, i) => {
          const isSystem = isSystemLanguage(e!.name)

          return (
          <Card key={`language-${e?.name}`} shadow="sm" withBorder={true} style={{ marginBottom: 20 }}>
            <Group align="flex-start">
              <Avatar radius="xl">{generateLanguageInitials(e!.name)}</Avatar>
              <Group direction='column' style={{marginTop: 4}}>
                <Group  direction='row'>
                  <Text weight="bold">DID: </Text>
                  <Text>{e?.address}</Text>
                </Group>
                <Group  direction='row'>
                  <Text weight="bold">Name: </Text>
                  <Text>{e?.name}</Text>
                </Group>
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
    </div>
  )
}

export default Language