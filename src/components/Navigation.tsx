import { Anchor, AppShell, Code, createStyles, Group, Navbar, Text, Image } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { Grain, Stack2, User, Settings as SettingsIcon } from 'tabler-icons-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { RouteContainer } from './styles';
import { Ad4minContext } from '../context/Ad4minContext';
import { version } from '../../package.json'

type Props = {
  did: String,
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
      backgroundColor: 'black'
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
  { label: 'Agent Profile', link: 'profile', icon: User },
  { label: 'Language & Expression', link: 'language', icon: Stack2 },
  { label: 'Perspectives', link: 'perspective', icon: Grain },
  { label: 'Settings', link: 'settings', icon: SettingsIcon },
]

const Navigation = (props: Props) => {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState('Agent Profile');
  const {state: {
    connected,
    isUnlocked
  }} = useContext(Ad4minContext);

  let navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate('/connect');
    } else if (connected && !isUnlocked) {
      navigate('/login');
    }
}, [connected, isUnlocked, navigate])

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
    <AppShell
      padding={0}
      navbar={
        <Navbar height='100vh' width={{ sm: 300 }} p="md" fixed style={{padding: 0}}>
          <Navbar.Section grow>
            <Group className={classes.header} position="apart">
              <Image src="ad4mlogo_white_angle2_colouremblem.png"></Image>
              <Code>{version}</Code>
            </Group>
            {links}
          </Navbar.Section>
        </Navbar>
      }
    >
      <div style={RouteContainer}>
      <Outlet />
      </div>
    </AppShell>
  )
}

export default Navigation