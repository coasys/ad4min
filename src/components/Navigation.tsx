import { Anchor, Code, createStyles, Group, Navbar, Text } from '@mantine/core';
import { useState } from 'react';
import { Grain, Stack2, User } from 'tabler-icons-react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import Profile from './Profile';
import Language from './Language';
import Perspectives from './Perspectives';

type Props = {
  did: String,
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25)
            : theme.colors[theme.primaryColor][0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.colors[theme.primaryColor][7],
        [`& .${icon}`]: {
          color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 7],
        },
      },
    },
  };
});

const data = [
  { label: 'Agent Profile', link: '/', icon: User },
  { label: 'Language & Expression', link: '/language', icon: Stack2 },
  { label: 'Perspectives', link: '/perspective', icon: Grain },
]

const Navigation = (props: Props) => {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState('Agent Profile');

  const links = data.map((item) => (
    <Anchor
      component={Link}
      className={cx(classes.link, { [classes.linkActive]: item.label === active })}
      underline={false}
      to={item.link}
      key={item.label}
      onClick={() => {
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} />
      <span>{item.label}</span>
    </Anchor>

  ))

  return (
    <Router>
      <Navbar height={700} width={{ sm: 300 }} p="md">
        <Navbar.Section grow>
          <Group className={classes.header} position="apart">
            <Text>Ad4min</Text>
            <Code>v0.0.3</Code>
          </Group>
          {links}
        </Navbar.Section>
      </Navbar>
      <Routes>
        <Route path="/" element={<Profile did={props.did} />} />
        <Route path="/language" element={<Language />} />
        <Route path="/perspective" element={<Perspectives />} />
      </Routes>
    </Router>
  )
}

export default Navigation