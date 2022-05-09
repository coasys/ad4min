import Header from './components/Header';
import Login from './components/Login';
import './App.css';
import { useContext, useEffect, useState } from 'react';
import { ExceptionType } from '@perspect3vism/ad4m';
import { ExceptionInfo } from '@perspect3vism/ad4m/lib/src/runtime/RuntimeResolver';
import { Loader, Stack } from '@mantine/core';
import TrustAgent from './components/TrustAgent';
import Navigation from './components/Navigation';
import { AgentContext } from './context/AgentContext';

const App = () => {
  const {state: {
    connected, isUnlocked, candidate, did
  }, methods: {
    handleTrustAgent,
  }} = useContext(AgentContext)

  return (
    <div className="App">
      {!connected && (
        <Stack align="center" spacing="xl" style={{margin: "auto"}}>
          <Header />
          <Loader />
        </Stack>
      )}
      {connected && !isUnlocked && (
        <Stack align="center" spacing="xl" style={{margin: "auto"}}>
          <Header />
          <Login />
        </Stack>
      )}
      {/* {isLogined && <Profile did={did} />} */}
      {/* {isLogined && <Language />} */}
      {isUnlocked && <Navigation did={did} />}
      {candidate && <TrustAgent candidate={candidate} handleTrustAgent={handleTrustAgent} />}
    </div>
  );
}

export default App;
