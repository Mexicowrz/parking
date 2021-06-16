import React, { useEffect, Suspense } from 'react';
import './App.css';
import { Login } from './pages/Login';
import { useSelector } from './hooks/useSelector';
import { useDispatch } from 'react-redux';
import { appEffects } from 'store/app';
import { Layout } from './components/Layout';
import { Routes } from './components/Routes';
import { BrowserRouter } from 'react-router-dom';
import { Preloader } from 'components/Preloader';

function App() {
  const dispatch = useDispatch();
  const { initializationInProgress, loggedIn } = useSelector(({ app }) => ({
    loggedIn: app.loggedIn,
    initializationInProgress: app.initializationInProgress,
  }));

  useEffect(() => {
    dispatch(appEffects.initApp());
  }, [dispatch]);

  return (
    <div className='App'>
      <Suspense fallback={''}>
        <BrowserRouter>
          {initializationInProgress ? (
            <Preloader />
          ) : (
            <>
              {loggedIn ? (
                <Layout>
                  <Routes />
                </Layout>
              ) : (
                <Login />
              )}
            </>
          )}
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

export default App;
