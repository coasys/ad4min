import { Button, Container, Stack, TextInput, Text } from '@mantine/core';
import { LanguageHandle } from '@perspect3vism/ad4m';
import { useContext, useState } from 'react';
import { Ad4mContext } from '..';

type Props = {
}

const Language = (props: Props) => {
  const ad4mClient = useContext(Ad4mContext);

  const [languageAddr, setLanguageAddr] = useState("");
  const [language, setLanguage] = useState<LanguageHandle | null>(null);
  const [loading, setLoading] = useState(false);

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

  const onLanguageAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let { value } = event.target;
    setLanguageAddr(value);
  }

  return (
    <div>
      <Stack align="flex-start" spacing="md" style={{margin: 20}}>
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
    </div>
  )
}

export default Language