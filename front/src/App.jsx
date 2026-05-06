import {
  Show,
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from '@clerk/react';
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';

function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;
  return (
    <Layout>
      <header>
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
        <p className="text-red-500">hello</p>
        <button className="btn btn-primary">click here</button>
      </header>
    </Layout>
  );
}

export default App;
