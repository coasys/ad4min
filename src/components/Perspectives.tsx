import { Button, Container, Group, Modal, MultiSelect, Select, Space, Switch, TextInput, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { LanguageHandle, Link, Perspective } from '@perspect3vism/ad4m';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Ad4mContext } from '..';
import { sanatizeLink } from '../util';
import { MainContainer, MainHeader } from './styles';

type Props = {
}

const Perspectives = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [perspectiveModalOpen, setPerspectiveModalOpen] = useState(false);
  const [languages, setLanguages] = useState<LanguageHandle[] | null[]>([]);
  const [perspectiveName, setPerspectiveName] = useState("");
  const [isNeighbourhood, setIsNeighbourhood] = useState(false)
  const [linkLanguage, setLinkLanguage] = useState('');
  const [linkLanguages, setLinkLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false)
  
  const fetchPerspective = async () => {
    const perspectives = await ad4mClient.perspective.all();

    const languages = await ad4mClient.languages.all();

    console.log(perspectives, languages)
  }

  const getLanguages = async () => {
    const langs = await ad4mClient.languages.all();

    setLanguages(langs);
  }
  
  useEffect(() => {
    fetchPerspective()
    getLanguages()
  }, [])

  const create = async () => {
    setLoading(true)

    const perspective = await ad4mClient.perspective.add(perspectiveName);
    
    try {
      if (isNeighbourhood) {
        const templateLangs = []
  
        const templatedLinkLang = await ad4mClient.languages.applyTemplateAndPublish(
          linkLanguage,
          JSON.stringify({
            uid: '123',
            name: `${perspectiveName}-social-context`
          })
        );
  
        const metaPerspective = await ad4mClient.perspective.add(`${perspectiveName}-meta`);

        for (const linkLanguage of linkLanguages) {
          const lang = (languages as LanguageHandle[]).find((e: LanguageHandle) => e.address === linkLanguage);
  
          if (lang) {
  
            const templatedLang = await ad4mClient.languages.applyTemplateAndPublish(
              lang.address,
              JSON.stringify({
                uid: '123',
                name: `${perspectiveName}-social-context`
              })
            );
  
            const link = await ad4mClient.perspective.addLink(metaPerspective.uuid, new Link({
              source: 'self',
              target: templatedLang.address,
              predicate: 'language'
            }));
  
            templateLangs.push(sanatizeLink(link))
          }
        }

        await ad4mClient.perspective.remove(metaPerspective.uuid)
  
        await ad4mClient.neighbourhood.publishFromPerspective(
          perspective.uuid, 
          templatedLinkLang.address,
          new Perspective(templateLangs)
        );
  
        showNotification({
          message: 'Neighbourhood sucessfully created',
        });
  
      } else {
        showNotification({
          message: 'Perspecctive sucessfully created',
        })
      }
    } catch (e) {
      ad4mClient.perspective.remove(perspective.uuid)
      showNotification({
        message: `Error: ${e}`,
        color: 'red'
      })
    }
    
    setLoading(false)
    setPerspectiveModalOpen(false)
  }

  const langs = useMemo(() => languages.map(e => ({label: e!.name, value: e!.address})), [languages])

  return (
    <Container
      style={MainContainer}
    >
      <Container style={MainHeader}>
        <Button onClick={() => setPerspectiveModalOpen(true)}>Add Perspective</Button>
      </Container>
      <Title order={3}>Perspectives </Title>
      <Modal
        opened={perspectiveModalOpen}
        onClose={() => setPerspectiveModalOpen(false)}
        title="Install Langauge"
        size={700}
        style={{zIndex: 100}}
      >
        <TextInput 
          label="Name"
          required
          placeholder='ex. Test Perspective' 
          radius="md" 
          size="md" 
          onChange={(e) => setPerspectiveName(e.target.value)}
        />
        <Space h="md"  />
        <Switch 
          checked={isNeighbourhood} 
          onChange={(event) => setIsNeighbourhood(event.currentTarget.checked)}
          label="Public Perspective"
        />
        {isNeighbourhood && (
          <>
            <Select
              label="Select link-language"
              placeholder="Pick one"
              data={langs}
              value={linkLanguage}
              onChange={(e) => setLinkLanguage(e as string)}
            />
            <Space h="md"  />
            <MultiSelect
              label="Select Dependent Languages"
              data={langs}
              required
              placeholder="Pick one"
              searchable
              value={linkLanguages}
              onChange={(e) => setLinkLanguages(e as string[])}
            />
          </>
        )}
        <Space h="md"  />
        <Group direction='row'>
          <Button onClick={() => setPerspectiveModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={create} loading={loading}>
            Create
          </Button>
        </Group>
      </Modal>
    </Container>
  )
}

export default Perspectives