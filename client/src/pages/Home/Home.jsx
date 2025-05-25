import { useSelector } from 'react-redux';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-fourth mb-4">Welcome to MyApp</h1>
      {user ? (
        <p className="text-lg text-tertiary">Hello, {user.username}! Your role: {user.roles}</p>
      ) : (
        <p className="text-lg text-tertiary">Please log in or sign up to continue.</p>
      )}
    </div>
  );
};

export default Home;