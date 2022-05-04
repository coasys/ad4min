import { Button, Container, Stack, TextInput, Text, Modal, MultiSelect, Space, Group } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { LanguageHandle } from '@perspect3vism/ad4m';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Ad4mContext } from '..';

type Props = {
}

const Language = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [languageAddr, setLanguageAddr] = useState("");
  const [language, setLanguage] = useState<LanguageHandle | null>(null);
  const [languages, setLanguages] = useState<LanguageHandle[] | null[]>([]);
  const [loading, setLoading] = useState(false);
  const [installLanguageModalOpen, setInstallLanguageModalOpen] = useState(true);

  const [languageName, setLanguageName] = useState("");
  const [languageDescription, setLanguageDescription] = useState("");
  const [languageSourceLink, setLanguageSourceLink] = useState("");
  const [languageBundlePath, setLanguageBundlePath] = useState("");
  const [data, setData] = useState<any[]>([]);

  const getLanguage = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      let language = await ad4mClient.languages.byAddress(languageAddr);
      console.log("language get result, ", language);
      setLanguage(language);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const installLanguage = async () => {
    if (languageBundlePath) {
      await ad4mClient.languages.publish(languageBundlePath, {
        name: languageName,
        description: languageDescription,
        possibleTemplateParams: data,
        sourceCodeLink: languageSourceLink
      });

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

  const onLanguageAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setLanguageAddr(value);
  }

  useEffect(() => {
    getLanguages();
  }, [])

  return (
    <div>
      <Stack align="flex-start" spacing="md" style={{ marginLeft: 48, marginTop: 82 }}>
        <div style={{ width: 480 }}>
          <TextInput
            type="text"
            placeholder="Input language address"
            label="Language Address"
            value={languageAddr}
            onChange={onLanguageAddrChange}
          />
        </div>
        <Button onClick={getLanguage} loading={loading}>
          Get Language
        </Button>
        {language && (
          <Container>
            <Text>Name: {language?.name}</Text>
            <Text>Address: {language?.address}</Text>
          </Container>
        )}
      </Stack>
      <Modal
        opened={installLanguageModalOpen}
        onClose={() => setInstallLanguageModalOpen(false)}
        title="Install Langauge"
        size={700}
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